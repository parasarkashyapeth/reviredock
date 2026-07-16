import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/neon.js';
import { authenticate } from '../middleware/auth.js';
import { feedbackLimiter } from '../middleware/rateLimit.js';
import { analyzeFeedback, analyzeBulkFeedback, analyzeExternalFeedback, fetchAndAnalyzeUrl } from '../services/ai.js';
import { sendNegativeFeedbackAlert, sendReplyToCustomer } from '../services/email.js';
import { isValidEmail, truncate } from '../middleware/sanitize.js';

const router = express.Router();

/**
 * POST /api/feedback/:businessId
 * Submit feedback (public - from QR code)
 */
router.post('/:businessId', feedbackLimiter, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { rating, message, customerEmail } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // SECURITY: Validate and limit input lengths
        if (message && message.length > 5000) {
            return res.status(400).json({ error: 'Feedback message is too long (max 5000 characters)' });
        }

        // SECURITY: Validate customer email format if provided
        if (customerEmail && !isValidEmail(customerEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if business exists
        const { rows: businessRows } = await query(
            'SELECT id, google_review_url, subscription_plan, monthly_feedback_count, monthly_feedback_limit, last_reset_date FROM businesses WHERE id = $1',
            [businessId]
        );

        const business = businessRows[0];

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Check monthly limit for free tier
        if (business.subscription_plan !== 'paid') {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            let currentCount = business.monthly_feedback_count || 0;

            // Reset if new month
            if (business.last_reset_date !== currentMonth) {
                currentCount = 0;
                await query(
                    'UPDATE businesses SET monthly_feedback_count = 0, last_reset_date = $1 WHERE id = $2',
                    [currentMonth, businessId]
                );
            }

            if (currentCount >= (business.monthly_feedback_limit || 50)) {
                return res.status(429).json({
                    error: 'Monthly feedback limit reached. Please upgrade to Pro for unlimited feedbacks.',
                    limitReached: true
                });
            }
        }

        // Determine if positive feedback (4-5 stars) — initial guess from rating
        let isPositive = rating >= 4;
        const feedbackId = uuidv4();

        // Run AI sentiment analysis BEFORE saving (instant, no retries — fallback is fast)
        let aiSentiment = null;
        let aiConfidence = null;
        let sentimentMismatch = false;

        if (message && message.trim()) {
            try {
                console.log(`[AI] Analyzing sentiment before saving feedback ${feedbackId}...`);
                const analysis = await analyzeFeedback(message.trim());

                if (analysis && analysis.sentiment) {
                    aiSentiment = analysis.sentiment;
                    aiConfidence = analysis.confidence || 0;

                    // Detect mismatch: high stars + negative text, OR low stars + positive text
                    sentimentMismatch =
                        (rating >= 4 && aiSentiment === 'negative') ||
                        (rating <= 2 && aiSentiment === 'positive');

                    // Correct is_positive based on AI when there's a mismatch
                    if (sentimentMismatch) {
                        isPositive = aiSentiment === 'positive';
                        console.log(`[AI] ⚠️ MISMATCH: Rating=${rating}★ but text is ${aiSentiment} (${aiConfidence}%) → is_positive=${isPositive}`);
                    } else {
                        console.log(`[AI] ✅ ${aiSentiment} (${aiConfidence}%) matches ${rating}★ rating`);
                    }
                }
            } catch (aiError) {
                console.error('[AI] Analysis failed, using star rating only:', aiError.message);
            }
        }

        // Insert feedback with AI-corrected sentiment already applied
        try {
            await query(
                `INSERT INTO feedbacks (id, business_id, rating, message, customer_email, is_positive, ai_sentiment, ai_confidence, sentiment_mismatch, notified)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [feedbackId, businessId, parseInt(rating), message || null,
                 customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : null,
                 isPositive, aiSentiment, aiConfidence, sentimentMismatch, false]
            );
        } catch (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ error: 'Failed to submit feedback' });
        }

        // Increment monthly count
        await query(
            'UPDATE businesses SET monthly_feedback_count = $1 WHERE id = $2',
            [(business.monthly_feedback_count || 0) + 1, businessId]
        );

        // Send email alert for negative feedback (non-blocking)
        if (!isPositive) {
            try {
                // Look up the business owner's email from the users table
                const { rows: ownerRows } = await query(
                    'SELECT email FROM users WHERE business_id = $1 LIMIT 1',
                    [businessId]
                );

                const { rows: businessDetails } = await query(
                    'SELECT name FROM businesses WHERE id = $1',
                    [businessId]
                );

                if (ownerRows[0]?.email) {
                    sendNegativeFeedbackAlert(
                        ownerRows[0].email,
                        businessDetails[0]?.name || 'Your Business',
                        { message: message || '', rating, sentiment: aiSentiment }
                    ).catch(err => console.error('[Email] Alert failed:', err.message));
                }
            } catch (emailErr) {
                console.error('[Email] Failed to send negative feedback alert:', emailErr.message);
            }
        }

        // Get primary review platform URL (with fallback to legacy google_review_url)
        let reviewUrl = business.google_review_url
        if (isPositive) {
            const { rows: platformRows } = await query(
                'SELECT url FROM review_platforms WHERE business_id = $1 AND is_primary = true AND is_active = true LIMIT 1',
                [businessId]
            );

            if (platformRows[0]?.url) {
                reviewUrl = platformRows[0].url;
            }
        }

        res.status(201).json({
            message: 'Feedback submitted successfully',
            isPositive,
            googleReviewUrl: isPositive ? reviewUrl : null
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

/**
 * GET /api/feedback/:businessId
 * Get feedbacks for a business (authenticated)
 */
router.get('/:businessId', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { filter, type } = req.query;

        // Verify ownership
        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized to access this business' });
        }

        // Build dynamic query
        let sql = 'SELECT * FROM feedbacks WHERE business_id = $1';
        const params = [businessId];
        let paramIdx = 2;

        // Apply date filter
        const now = new Date();
        if (filter === 'today') {
            const today = now.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(today);
            paramIdx++;
        } else if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(weekAgo.toISOString());
            paramIdx++;
        } else if (filter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(monthAgo.toISOString());
            paramIdx++;
        } else if (filter === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(startOfYear.toISOString());
            paramIdx++;
        }
        // filter === 'all' or undefined → no date filter → fetch everything

        // Apply type filter
        if (type === 'negative') {
            sql += ` AND is_positive = false`;
        } else if (type === 'positive') {
            sql += ` AND is_positive = true`;
        }

        sql += ' ORDER BY created_at DESC LIMIT 500';

        const { rows: feedbacks } = await query(sql, params);

        // Strip customer_email for privacy but indicate if one exists
        const sanitized = (feedbacks || []).map(fb => {
            const { customer_email, ...rest } = fb;
            return { ...rest, has_email: !!customer_email };
        });

        res.json({ feedbacks: sanitized });
    } catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({ error: 'Failed to get feedbacks' });
    }
});

/**
 * POST /api/feedback/:businessId/external
 * Submit feedback from external source (Google Forms, surveys, etc.)
 * AI analyzes the text to determine sentiment & rating
 */
router.post('/:businessId/external', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { text, source } = req.body;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Feedback text is required' });
        }

        // AI analyzes the feedback
        const analysis = await analyzeExternalFeedback(text);

        const feedbackId = uuidv4();

        // Insert the analyzed feedback
        try {
            await query(
                `INSERT INTO feedbacks (id, business_id, rating, message, is_positive, notified, source, ai_sentiment, ai_confidence, ai_summary, ai_category)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [feedbackId, businessId, analysis.rating, text.trim(), analysis.isPositive, false,
                 source || 'external', analysis.sentiment, analysis.confidence, analysis.summary, analysis.category]
            );
        } catch (insertError) {
            // If columns don't exist, insert without AI fields
            try {
                await query(
                    'INSERT INTO feedbacks (id, business_id, rating, message, is_positive, notified) VALUES ($1, $2, $3, $4, $5, $6)',
                    [feedbackId, businessId, analysis.rating, text.trim(), analysis.isPositive, false]
                );
            } catch (fallbackError) {
                console.error('Insert external feedback error:', fallbackError);
                return res.status(500).json({ error: 'Failed to save feedback' });
            }
        }

        res.status(201).json({
            message: 'External feedback analyzed and saved',
            feedback: {
                id: feedbackId,
                text: text.trim(),
                analysis
            }
        });
    } catch (error) {
        console.error('External feedback error:', error);
        res.status(500).json({ error: 'Failed to process external feedback' });
    }
});

/**
 * GET /api/feedback/:businessId/ai-summary
 * Get AI-generated summary of all feedbacks for a business
 */
router.get('/:businessId/ai-summary', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { filter } = req.query;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Build dynamic query
        let sql = 'SELECT * FROM feedbacks WHERE business_id = $1';
        const params = [businessId];
        let paramIdx = 2;

        const now = new Date();
        if (filter === 'today') {
            const today = now.toISOString().split('T')[0];
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(today);
            paramIdx++;
        } else if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(weekAgo.toISOString());
            paramIdx++;
        } else if (filter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(monthAgo.toISOString());
            paramIdx++;
        }

        sql += ' ORDER BY created_at DESC LIMIT 200';

        const { rows: feedbacks } = await query(sql, params);

        if (!feedbacks || feedbacks.length === 0) {
            return res.json({
                totalAnalyzed: 0,
                overallSummary: 'No feedback available for this period.',
                positive: 0,
                negative: 0,
                topPositivePoints: [],
                topNegativePoints: [],
                recommendations: []
            });
        }

        // AI bulk analysis
        const summary = await analyzeBulkFeedback(feedbacks);

        res.json(summary);
    } catch (error) {
        console.error('AI summary error:', error);
        res.status(500).json({ error: 'Failed to generate AI summary' });
    }
});

/**
 * POST /api/feedback/:businessId/analyze-url
 * Fetch a URL, extract page content, analyze all feedback found with AI
 */
router.post('/:businessId/analyze-url', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { url, platformLabel, platformName } = req.body;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`[analyze-url] Fetching and analyzing: ${url}`);

        // Fetch and analyze the URL content
        const analysis = await fetchAndAnalyzeUrl(url, platformLabel);

        if (analysis.error && !analysis.success) {
            return res.status(400).json({ error: analysis.error });
        }

        // Save each found feedback into the database
        let savedCount = 0;
        if (analysis.feedbacks && analysis.feedbacks.length > 0) {
            for (const fb of analysis.feedbacks) {
                const feedbackId = uuidv4();
                const fbRating = Math.min(5, Math.max(1, fb.rating || 3));
                const fbIsPositive = fb.sentiment === 'positive' || fbRating >= 4;

                try {
                    await query(
                        'INSERT INTO feedbacks (id, business_id, rating, message, is_positive, notified) VALUES ($1, $2, $3, $4, $5, $6)',
                        [feedbackId, businessId, fbRating, fb.text || fb.summary || 'No text', fbIsPositive, false]
                    );
                    savedCount++;
                } catch (insertError) {
                    // Skip individual insert failures
                }
            }
        }

        console.log(`[analyze-url] Found ${analysis.totalFound} feedbacks, saved ${savedCount}`);

        res.json({
            ...analysis,
            savedCount
        });
    } catch (error) {
        console.error('Analyze URL error:', error);
        res.status(500).json({ error: 'Failed to analyze URL' });
    }
});

/**
 * POST /api/feedback/:businessId/:feedbackId/reply
 * Reply to a feedback (business owner)
 */
router.post('/:businessId/:feedbackId/reply', authenticate, async (req, res) => {
    try {
        const { businessId, feedbackId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { reply } = req.body;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!reply && reply !== '') {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        // If reply is empty string, it means "hide/remove reply"
        const ownerReply = reply.trim() ? reply.trim() : null;
        const repliedAt = reply.trim() ? new Date().toISOString() : null;

        const { rows } = await query(
            `UPDATE feedbacks SET owner_reply = $1, replied_at = $2
             WHERE id = $3 AND business_id = $4
             RETURNING *`,
            [ownerReply, repliedAt, feedbackId, businessId]
        );

        const data = rows[0];

        if (!data) {
            return res.status(500).json({ error: 'Failed to save reply' });
        }

        // Respond immediately — don't block on email sending (prevents Vercel proxy timeout / 502)
        const hasEmail = !!(data?.customer_email && reply.trim());
        res.json({ message: 'Reply saved', feedback: data, emailSent: hasEmail ? 'pending' : false });

        // Fire-and-forget: send reply email to customer in background
        if (hasEmail) {
            (async () => {
                try {
                    const { rows: bizRows } = await query(
                        'SELECT name FROM businesses WHERE id = $1',
                        [businessId]
                    );

                    const result = await sendReplyToCustomer(
                        data.customer_email,
                        bizRows[0]?.name || 'The Business',
                        {
                            originalMessage: data.message || '',
                            originalRating: data.rating,
                            replyText: reply.trim()
                        }
                    );
                    console.log(`[Email] Reply sent to customer ${data.customer_email}: ${result.success}`);
                } catch (emailErr) {
                    console.error('[Email] Failed to send reply to customer:', emailErr.message);
                }
            })();
        }
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: 'Failed to save reply' });
    }
});

/**
 * DELETE /api/feedback/:businessId/:feedbackId
 * Delete a feedback entry
 */
router.delete('/:businessId/:feedbackId', authenticate, async (req, res) => {
    try {
        const { businessId, feedbackId } = req.params;
        const { businessId: userBusinessId } = req.user;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rowCount } = await query(
            'DELETE FROM feedbacks WHERE id = $1 AND business_id = $2',
            [feedbackId, businessId]
        );

        if (rowCount === 0) {
            console.error('Delete feedback error: no rows deleted');
            return res.status(500).json({ error: 'Failed to delete feedback' });
        }

        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

/**
 * PATCH /api/feedback/:businessId/:feedbackId/pin
 * Toggle pin/bookmark on a feedback
 */
router.patch('/:businessId/:feedbackId/pin', authenticate, async (req, res) => {
    try {
        const { businessId, feedbackId } = req.params;
        const { businessId: userBusinessId } = req.user;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get current pin state
        const { rows } = await query(
            'SELECT is_pinned FROM feedbacks WHERE id = $1 AND business_id = $2',
            [feedbackId, businessId]
        );

        const feedback = rows[0];

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const newPinState = !feedback.is_pinned;

        const { rowCount } = await query(
            'UPDATE feedbacks SET is_pinned = $1 WHERE id = $2 AND business_id = $3',
            [newPinState, feedbackId, businessId]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to update pin status' });
        }

        res.json({ message: newPinState ? 'Feedback pinned' : 'Feedback unpinned', is_pinned: newPinState });
    } catch (error) {
        console.error('Pin feedback error:', error);
        res.status(500).json({ error: 'Failed to pin feedback' });
    }
});

/**
 * GET /api/feedback/:businessId/export
 * Export feedbacks as CSV
 */
router.get('/:businessId/export', authenticate, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessId: userBusinessId } = req.user;
        const { filter, type } = req.query;

        if (businessId !== userBusinessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        let sql = 'SELECT * FROM feedbacks WHERE business_id = $1';
        const params = [businessId];
        let paramIdx = 2;

        // Apply date filter
        const now = new Date();
        if (filter === 'today') {
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(now.toISOString().split('T')[0]);
            paramIdx++;
        } else if (filter === 'week') {
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());
            paramIdx++;
        } else if (filter === 'month') {
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());
            paramIdx++;
        } else if (filter === 'year') {
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(new Date(now.getFullYear(), 0, 1).toISOString());
            paramIdx++;
        }

        if (type === 'negative') sql += ' AND is_positive = false';
        else if (type === 'positive') sql += ' AND is_positive = true';

        sql += ' ORDER BY created_at DESC LIMIT 5000';

        const { rows: feedbacks } = await query(sql, params);

        // Build CSV
        const headers = ['Date', 'Time', 'Rating', 'Sentiment', 'Message', 'AI Sentiment', 'AI Confidence', 'Owner Reply', 'Reply Date'];
        const csvRows = (feedbacks || []).map(fb => {
            const date = fb.created_at ? new Date(fb.created_at) : null;
            return [
                date ? date.toLocaleDateString() : '',
                date ? date.toLocaleTimeString() : '',
                fb.rating != null ? fb.rating : '',
                fb.is_positive ? 'Positive' : 'Negative',
                `"${(fb.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                fb.ai_sentiment || '',
                fb.ai_confidence != null ? fb.ai_confidence : '',
                `"${(fb.owner_reply || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                fb.replied_at ? new Date(fb.replied_at).toLocaleDateString() : ''
            ].join(',');
        });

        const csv = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=feedbacks_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export feedbacks' });
    }
});

export default router;
