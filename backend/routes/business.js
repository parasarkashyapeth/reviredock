import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/neon.js';
import { authenticate } from '../middleware/auth.js';
import { analyzeBulkSummary } from '../services/ai.js';
import { isSafeUrl } from '../middleware/sanitize.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

console.log('Frontend URL for QR:', FRONTEND_URL);

/**
 * GET /api/business/:id
 * Get business info (public - for feedback page)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await query(
            'SELECT id, name, category, logo_url, google_review_url FROM businesses WHERE id = $1',
            [id]
        );

        const business = rows[0];

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        res.json(business);
    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({ error: 'Failed to get business info' });
    }
});

/**
 * Detect platform from URL
 */
function detectPlatform(url) {
    const lowerUrl = url.toLowerCase();

    // Google Maps / Google Business
    if (lowerUrl.includes('google.com/maps') ||
        lowerUrl.includes('maps.google.com') ||
        lowerUrl.includes('g.page') ||
        lowerUrl.includes('goo.gl') ||
        lowerUrl.includes('search.google.com/local') ||
        (lowerUrl.includes('google.com') && lowerUrl.includes('review'))) {
        return { platform: 'google', label: 'Google Maps' };
    }

    // Google Forms
    if (lowerUrl.includes('docs.google.com/forms') || lowerUrl.includes('forms.gle')) {
        return { platform: 'google_forms', label: 'Google Forms' };
    }

    // Yelp
    if (lowerUrl.includes('yelp.com')) {
        return { platform: 'yelp', label: 'Yelp' };
    }

    // TripAdvisor
    if (lowerUrl.includes('tripadvisor.com') || lowerUrl.includes('tripadvisor.')) {
        return { platform: 'tripadvisor', label: 'TripAdvisor' };
    }

    // Facebook
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
        return { platform: 'facebook', label: 'Facebook' };
    }

    // Trustpilot
    if (lowerUrl.includes('trustpilot.com')) {
        return { platform: 'trustpilot', label: 'Trustpilot' };
    }

    // Zomato
    if (lowerUrl.includes('zomato.com')) {
        return { platform: 'zomato', label: 'Zomato' };
    }

    // Swiggy
    if (lowerUrl.includes('swiggy.com')) {
        return { platform: 'swiggy', label: 'Swiggy' };
    }

    // SurveyMonkey
    if (lowerUrl.includes('surveymonkey.com') || lowerUrl.includes('surveymonkey.')) {
        return { platform: 'surveymonkey', label: 'SurveyMonkey' };
    }

    // Typeform
    if (lowerUrl.includes('typeform.com')) {
        return { platform: 'typeform', label: 'Typeform' };
    }

    // JotForm
    if (lowerUrl.includes('jotform.com')) {
        return { platform: 'jotform', label: 'JotForm' };
    }

    // Amazon
    if (lowerUrl.includes('amazon.com') || lowerUrl.includes('amazon.in')) {
        return { platform: 'amazon', label: 'Amazon' };
    }

    // Booking.com
    if (lowerUrl.includes('booking.com')) {
        return { platform: 'booking', label: 'Booking.com' };
    }

    // Airbnb
    if (lowerUrl.includes('airbnb.com') || lowerUrl.includes('airbnb.')) {
        return { platform: 'airbnb', label: 'Airbnb' };
    }

    // Default: custom platform
    return { platform: 'custom', label: 'Custom' };
}

/**
 * POST /api/business/generate-ideas
 * Generate personalised business ideas via OpenRouter AI (public endpoint)
 */
router.post('/generate-ideas', async (req, res) => {
    try {
        const { situation, skills, timePerWeek, budget } = req.body;

        if (!situation) {
            return res.status(400).json({ error: 'Situation is required' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ error: 'AI service not configured' });
        }

        const situationLabels = {
            student: 'Student (college/university)',
            employed: 'Employed (working 9-to-5)',
            owner: 'Business Owner',
            freelancer: 'Freelancer / Self-employed',
            between: 'Career Change / Between jobs',
        };

        const prompt = `You are an expert business advisor specializing in realistic, actionable side hustles and business ideas for the Indian market.

A user has the following profile:
- Current situation: ${situationLabels[situation] || situation}
- Skills: ${skills && skills.length > 0 ? skills.join(', ') : 'not specified'}
- Available time per week: ${timePerWeek || '5-10'} hours
- Starting budget: ${budget || 'low'}

Generate exactly 4 highly personalised, realistic business ideas tailored to this profile. Each idea must be specific and immediately actionable for someone in India.

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "name": "Idea Name",
    "icon": "single emoji",
    "desc": "One sentence description max 120 chars",
    "income": "₹X,000–₹Y,000/mo",
    "first": "X days/weeks",
    "fit": 85,
    "tags": ["skill1", "skill2"],
    "tools": ["Tool1", "Tool2", "Tool3"],
    "steps": [
      "Specific actionable step 1",
      "Specific actionable step 2",
      "Specific actionable step 3"
    ]
  }
]

Rules:
- fit score must be 70-99 (integer), reflecting match with given skills
- income must use ₹ sign and /mo format
- first must be realistic timeframe like "3-5 days", "1-2 weeks"
- tools must be real, free or low-cost tools
- steps must be specific and immediately actionable
- tags must be from: design, dev, marketing, sales, writing, teaching, finance, video, trade, data, community, photography
- Return ONLY the JSON array, nothing else`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:8000',
                'X-Title': 'ReviewDock Business Idea Generator',
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('OpenRouter error:', response.status, errText);
            return res.status(502).json({ error: 'AI service error, please try again' });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return res.status(502).json({ error: 'Empty response from AI' });
        }

        // Parse the JSON — strip markdown code fences if present
        let ideas;
        try {
            const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            ideas = JSON.parse(cleaned);
            if (!Array.isArray(ideas)) throw new Error('Not an array');
        } catch (parseErr) {
            console.error('Failed to parse AI response:', content, parseErr);
            return res.status(502).json({ error: 'AI returned invalid format, please try again' });
        }

        res.json({ ideas });
    } catch (error) {
        console.error('Generate ideas error:', error);
        res.status(500).json({ error: 'Failed to generate ideas' });
    }
});

/**
 * POST /api/business/validate-review-url
 * Validate any review platform URL (replaces validate-google-url)
 */
router.post('/validate-review-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ valid: false, error: 'URL is required' });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return res.json({
                valid: false,
                error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://'
            });
        }

        // SECURITY: SSRF protection — block private/internal IPs
        if (!isSafeUrl(url)) {
            return res.json({
                valid: false,
                error: 'URL points to a restricted address and cannot be validated'
            });
        }

        // Detect platform
        const { platform, label } = detectPlatform(url);

        // Try to fetch the URL to verify it's accessible
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; FeedbackBot/1.0)'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok || response.status === 301 || response.status === 302 || response.status === 307) {
                return res.json({
                    valid: true,
                    platform,
                    label,
                    message: `${label} URL is valid and accessible`
                });
            } else {
                return res.json({
                    valid: true, // Still allow it
                    platform,
                    label,
                    warning: `URL returned status ${response.status}, but format is correct`
                });
            }
        } catch (fetchError) {
            // Allow URL if format is valid even if we can't fetch it
            return res.json({
                valid: true,
                platform,
                label,
                message: 'URL format is valid',
                warning: 'Could not verify accessibility, but URL format appears correct'
            });
        }
    } catch (error) {
        console.error('Validate review URL error:', error);
        res.status(500).json({ valid: false, error: 'Failed to validate URL' });
    }
});

// Keep old endpoint for backwards compatibility
router.post('/validate-google-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ valid: false, error: 'URL is required' });
        }

        // Check URL format first
        const lowerUrl = url.toLowerCase();
        const isValidFormat =
            lowerUrl.includes('google.com/maps') ||
            lowerUrl.includes('maps.google.com') ||
            lowerUrl.includes('g.page') ||
            lowerUrl.includes('goo.gl') ||
            lowerUrl.includes('search.google.com/local') ||
            (lowerUrl.includes('google.com') && lowerUrl.includes('review'));

        if (!isValidFormat) {
            return res.json({
                valid: false,
                error: 'URL does not appear to be a valid Google review link. Please use a link from Google Maps or Google Business Profile.',
                suggestion: 'Valid formats: https://g.page/r/..., https://maps.google.com/..., or your Google Maps business link'
            });
        }

        // Try to fetch the URL to verify it's accessible
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; FeedbackBot/1.0)'
                }
            });

            clearTimeout(timeoutId);

            // Check for successful response or redirect (Google often redirects)
            if (response.ok || response.status === 301 || response.status === 302 || response.status === 307) {
                return res.json({
                    valid: true,
                    message: 'Google review URL is valid and accessible'
                });
            } else {
                return res.json({
                    valid: false,
                    error: `URL returned status ${response.status}. Please verify the link is correct.`
                });
            }
        } catch (fetchError) {
            // If fetch fails, still allow the URL if it has the right format
            // Some Google URLs may block bots but still work for users
            if (fetchError.name === 'AbortError') {
                return res.json({
                    valid: true,
                    message: 'URL format is valid (response timeout - may still work)',
                    warning: 'Could not fully verify the URL, but format appears correct'
                });
            }

            console.log('URL validation fetch error:', fetchError.message);
            return res.json({
                valid: true,
                message: 'URL format is valid',
                warning: 'Could not fully verify accessibility, but format appears correct'
            });
        }
    } catch (error) {
        console.error('Validate Google URL error:', error);
        res.status(500).json({ valid: false, error: 'Failed to validate URL' });
    }
});
/**
 * PUT /api/business/profile
 * Update business profile after signup (authenticated)
 * Used by the ProfileSetup page (step 2 of signup)
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { businessId, userId } = req.user;
        const { businessName, category, logoUrl, ownerName } = req.body;

        if (!businessName || !category) {
            return res.status(400).json({ error: 'Business name and category are required' });
        }

        // Update business
        let bizSql = 'UPDATE businesses SET name = $1, category = $2';
        const bizParams = [businessName, category];
        let bizIdx = 3;

        if (logoUrl !== undefined) {
            bizSql += `, logo_url = $${bizIdx}`;
            bizParams.push(logoUrl);
            bizIdx++;
        }

        bizSql += ` WHERE id = $${bizIdx}`;
        bizParams.push(businessId);

        const { rowCount: bizCount } = await query(bizSql, bizParams);

        if (bizCount === 0) {
            return res.status(500).json({ error: 'Failed to update business' });
        }

        // Update owner name on user record
        if (ownerName !== undefined) {
            const { rowCount } = await query(
                'UPDATE users SET owner_name = $1 WHERE id = $2',
                [ownerName, userId]
            );
            if (rowCount === 0) {
                console.error('Profile update - user error: no rows updated');
                // Don't fail the whole request for this
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/business/:id
 * Update business info (authenticated)
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { name, category, googleReviewUrl, logoUrl } = req.body;

        // Verify user owns this business
        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized to update this business' });
        }

        const updates = [];
        const params = [];
        let paramIdx = 1;

        if (name) { updates.push(`name = $${paramIdx}`); params.push(name); paramIdx++; }
        if (category) { updates.push(`category = $${paramIdx}`); params.push(category); paramIdx++; }
        if (googleReviewUrl) { updates.push(`google_review_url = $${paramIdx}`); params.push(googleReviewUrl); paramIdx++; }
        if (logoUrl !== undefined) { updates.push(`logo_url = $${paramIdx}`); params.push(logoUrl); paramIdx++; }

        if (updates.length === 0) {
            return res.json({ message: 'No updates provided' });
        }

        params.push(id);
        const sql = `UPDATE businesses SET ${updates.join(', ')} WHERE id = $${paramIdx}`;

        const { rowCount } = await query(sql, params);

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to update business' });
        }

        res.json({ message: 'Business updated successfully' });
    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({ error: 'Failed to update business' });
    }
});

/**
 * GET /api/business/:id/platforms
 * Get all review platforms for a business
 */
router.get('/:id/platforms', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;

        console.log('[GET platforms] Requested id:', id, 'User businessId:', businessId);

        if (id !== businessId) {
            console.log('[GET platforms] Auth mismatch - returning 403');
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rows: platforms } = await query(
            'SELECT * FROM review_platforms WHERE business_id = $1 AND is_active = true ORDER BY is_primary DESC, created_at ASC',
            [id]
        );

        console.log('[GET platforms] Found', (platforms || []).length, 'platforms');
        res.json({ platforms: platforms || [] });
    } catch (error) {
        console.error('Get platforms error:', error);
        res.status(500).json({ error: 'Failed to get platforms' });
    }
});

/**
 * POST /api/business/:id/platforms
 * Add a new review platform
 */
router.post('/:id/platforms', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { url, isPrimary = false, customLabel } = req.body;

        console.log('[POST platform] id:', id, 'businessId:', businessId, 'body:', JSON.stringify(req.body));

        if (id !== businessId) {
            console.log('[POST platform] Auth mismatch - returning 403');
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Detect platform
        const { platform, label } = detectPlatform(url);
        const finalLabel = customLabel || label;

        // If setting as primary, unset other primaries
        if (isPrimary) {
            await query(
                'UPDATE review_platforms SET is_primary = false WHERE business_id = $1',
                [id]
            );
        }

        // Check for duplicate URL
        const { rows: existingRows } = await query(
            'SELECT id FROM review_platforms WHERE business_id = $1 AND url = $2',
            [id, url]
        );

        if (existingRows.length > 0) {
            console.log('[POST platform] Duplicate URL found:', url);
            return res.status(400).json({ error: 'This URL is already added' });
        }

        // Insert new platform
        const { rows: newPlatformRows } = await query(
            `INSERT INTO review_platforms (business_id, platform_name, platform_label, url, is_primary, is_active)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, platform, finalLabel, url, isPrimary, true]
        );

        const newPlatform = newPlatformRows[0];

        if (!newPlatform) {
            return res.status(500).json({ error: 'Failed to add platform' });
        }

        console.log('[POST platform] Successfully inserted:', JSON.stringify(newPlatform));

        // Also update the legacy google_review_url if this is primary
        if (isPrimary) {
            await query(
                'UPDATE businesses SET google_review_url = $1 WHERE id = $2',
                [url, id]
            );
        }

        res.json({
            message: 'Platform added successfully',
            platform: newPlatform
        });
    } catch (error) {
        console.error('Add platform error:', error);
        res.status(500).json({ error: 'Failed to add platform' });
    }
});

/**
 * PUT /api/business/:id/platforms/:platformId
 * Update a review platform
 */
router.put('/:id/platforms/:platformId', authenticate, async (req, res) => {
    try {
        const { id, platformId } = req.params;
        const { businessId } = req.user;
        const { url, isPrimary, customLabel, isActive } = req.body;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updates = [];
        const params = [];
        let paramIdx = 1;

        if (url) {
            const { platform: detectedPlatform, label: detectedLabel } = detectPlatform(url);
            updates.push(`url = $${paramIdx}`); params.push(url); paramIdx++;
            updates.push(`platform_name = $${paramIdx}`); params.push(detectedPlatform); paramIdx++;
            updates.push(`platform_label = $${paramIdx}`); params.push(customLabel || detectedLabel); paramIdx++;
        }

        if (customLabel && !url) {
            updates.push(`platform_label = $${paramIdx}`); params.push(customLabel); paramIdx++;
        }

        if (typeof isActive === 'boolean') {
            updates.push(`is_active = $${paramIdx}`); params.push(isActive); paramIdx++;
        }

        // Handle primary flag
        if (isPrimary === true) {
            // Unset other primaries first
            await query(
                'UPDATE review_platforms SET is_primary = false WHERE business_id = $1',
                [id]
            );
            updates.push(`is_primary = true`);
        } else if (isPrimary === false) {
            updates.push(`is_primary = false`);
        }

        if (updates.length === 0) {
            return res.json({ message: 'No updates provided' });
        }

        params.push(platformId, id);
        const sql = `UPDATE review_platforms SET ${updates.join(', ')} WHERE id = $${paramIdx} AND business_id = $${paramIdx + 1} RETURNING *`;

        const { rows } = await query(sql, params);
        const updatedPlatform = rows[0];

        if (!updatedPlatform) {
            return res.status(500).json({ error: 'Failed to update platform' });
        }

        // Update legacy google_review_url if this became primary
        if (isPrimary === true && updatedPlatform?.url) {
            await query(
                'UPDATE businesses SET google_review_url = $1 WHERE id = $2',
                [updatedPlatform.url, id]
            );
        }

        res.json({
            message: 'Platform updated successfully',
            platform: updatedPlatform
        });
    } catch (error) {
        console.error('Update platform error:', error);
        res.status(500).json({ error: 'Failed to update platform' });
    }
});

/**
 * DELETE /api/business/:id/platforms/:platformId
 * Delete a review platform
 */
router.delete('/:id/platforms/:platformId', authenticate, async (req, res) => {
    try {
        const { id, platformId } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rowCount } = await query(
            'DELETE FROM review_platforms WHERE id = $1 AND business_id = $2',
            [platformId, id]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to delete platform' });
        }

        res.json({ message: 'Platform deleted successfully' });
    } catch (error) {
        console.error('Delete platform error:', error);
        res.status(500).json({ error: 'Failed to delete platform' });
    }
});

/**
 * GET /api/business/:id/qr
 * Generate QR code for feedback (authenticated)
 */
router.get('/:id/qr', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;

        // Verify user owns this business
        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized to access this business' });
        }

        const { rows } = await query(
            'SELECT id, name FROM businesses WHERE id = $1',
            [id]
        );

        const business = rows[0];

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Generate feedback URL
        const feedbackUrl = `${FRONTEND_URL}/b/${id}`;

        // Generate QR code as data URL
        const qrCode = await QRCode.toDataURL(feedbackUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        res.json({
            qrCode,
            feedbackUrl,
            businessName: business.name
        });
    } catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

/**
 * GET /api/business/:id/stats
 * Get feedback statistics (authenticated)
 */
router.get('/:id/stats', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { filter } = req.query;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized to access this business' });
        }

        // Build date filter
        let dateFilter = null;
        let prevDateFilter = null;
        const now = new Date();

        if (filter === 'today') {
            const today = now.toISOString().split('T')[0];
            dateFilter = today;
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            prevDateFilter = { start: yesterday.toISOString().split('T')[0], end: today };
        } else if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = weekAgo.toISOString();
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            prevDateFilter = { start: twoWeeksAgo.toISOString(), end: weekAgo.toISOString() };
        } else if (filter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateFilter = monthAgo.toISOString();
            const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            prevDateFilter = { start: twoMonthsAgo.toISOString(), end: monthAgo.toISOString() };
        } else if (filter === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = startOfYear.toISOString();
            const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
            prevDateFilter = { start: startOfLastYear.toISOString(), end: startOfYear.toISOString() };
        }

        // Build query
        let sql = 'SELECT * FROM feedbacks WHERE business_id = $1';
        const params = [id];
        let paramIdx = 2;

        if (dateFilter) {
            sql += ` AND created_at >= $${paramIdx}`;
            params.push(dateFilter);
            paramIdx++;
        }

        const { rows: feedbacks } = await query(sql, params);

        const total = feedbacks?.length || 0;
        const positive = feedbacks?.filter(f => f.is_positive).length || 0;
        const negative = total - positive;
        const avgRating = total > 0
            ? parseFloat((feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1))
            : 0;
        const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;

        // NPS Score: Promoters (4-5) - Detractors (1-2), Passives (3) ignored
        const promoters = feedbacks?.filter(f => f.rating >= 4).length || 0;
        const detractors = feedbacks?.filter(f => f.rating <= 2).length || 0;
        const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

        // Response Rate: % of feedbacks with owner_reply
        const replied = feedbacks?.filter(f => f.owner_reply).length || 0;
        const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0;

        // Average response time (hours) for replied feedbacks
        let avgResponseTime = null;
        const repliedFeedbacks = feedbacks?.filter(f => f.owner_reply && f.replied_at && f.created_at) || [];
        if (repliedFeedbacks.length > 0) {
            const totalHours = repliedFeedbacks.reduce((sum, f) => {
                const diff = new Date(f.replied_at) - new Date(f.created_at);
                return sum + (diff / (1000 * 60 * 60));
            }, 0);
            avgResponseTime = parseFloat((totalHours / repliedFeedbacks.length).toFixed(1));
        }

        // Rating distribution (1-5 stars)
        const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
            star,
            count: feedbacks?.filter(f => f.rating === star).length || 0,
            percentage: total > 0 ? Math.round((feedbacks?.filter(f => f.rating === star).length || 0) / total * 100) : 0
        }));

        // Period comparison - fetch previous period data
        let comparison = null;
        if (prevDateFilter) {
            const { rows: prevFeedbacks } = await query(
                'SELECT rating, is_positive FROM feedbacks WHERE business_id = $1 AND created_at >= $2 AND created_at < $3',
                [id, prevDateFilter.start, prevDateFilter.end]
            );

            const prevTotal = prevFeedbacks?.length || 0;
            const prevPositive = prevFeedbacks?.filter(f => f.is_positive).length || 0;
            const prevNegative = prevTotal - prevPositive;
            const prevAvgRating = prevTotal > 0
                ? parseFloat((prevFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / prevTotal).toFixed(1))
                : 0;

            comparison = {
                totalChange: prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : (total > 0 ? 100 : 0),
                positiveChange: prevPositive > 0 ? Math.round(((positive - prevPositive) / prevPositive) * 100) : (positive > 0 ? 100 : 0),
                negativeChange: prevNegative > 0 ? Math.round(((negative - prevNegative) / prevNegative) * 100) : (negative > 0 ? 100 : 0),
                ratingChange: prevAvgRating > 0 ? parseFloat((avgRating - prevAvgRating).toFixed(1)) : 0,
            };
        }

        // Top keywords from feedback messages
        const stopWords = new Set(['the', 'is', 'at', 'in', 'it', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'but', 'if', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'we', 'you', 'i', 'me', 'he', 'she', 'with', 'on', 'from', 'by', 'are', 'am', 'so', 'very', 'just', 'all', 'no', 'yes', 'also', 'too', 'more', 'much', 'than', 'then', 'about', 'up', 'out', 'what', 'which', 'who', 'when', 'where', 'how', 'here', 'there', 'really', 'get', 'got', 'us']);
        const wordCounts = {};
        (feedbacks || []).forEach(f => {
            if (f.message) {
                f.message.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(word => {
                    if (word.length > 2 && !stopWords.has(word)) {
                        wordCounts[word] = (wordCounts[word] || 0) + 1;
                    }
                });
            }
        });
        // Only words mentioned more than once
        const topKeywords = Object.entries(wordCounts)
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word, count]) => ({ word, count }));

        res.json({
            total, positive, negative, avgRating, positiveRate,
            npsScore, responseRate, avgResponseTime,
            ratingDistribution, comparison, topKeywords,
            replied, totalWithMessages: feedbacks?.filter(f => f.message).length || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

/**
 * GET /api/business/:id/plan
 * Get subscription plan info (authenticated)
 */
router.get('/:id/plan', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized to access this business' });
        }

        const { rows } = await query(
            'SELECT subscription_plan, monthly_feedback_limit, monthly_feedback_count, last_reset_date FROM businesses WHERE id = $1',
            [id]
        );

        const business = rows[0];

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Check if we need to reset for new month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let usedThisMonth = business.monthly_feedback_count || 0;

        if (business.last_reset_date !== currentMonth) {
            usedThisMonth = 0;
        }

        res.json({
            plan: business.subscription_plan || 'free',
            limit: business.monthly_feedback_limit || 50,
            usedThisMonth,
            isUnlimited: business.subscription_plan === 'paid'
        });
    } catch (error) {
        console.error('Plan info error:', error);
        res.status(500).json({ error: 'Failed to get plan info' });
    }
});

/**
 * GET /api/business/:id/alerts
 * Get unread feedback count and new negative feedbacks (for extension)
 */
router.get('/:id/alerts', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get unread negative feedback count
        const { rows: unreadFeedbacks } = await query(
            'SELECT id FROM feedbacks WHERE business_id = $1 AND is_positive = false AND notified = false',
            [id]
        );

        // Get new negative feedbacks
        const { rows: newNegative } = await query(
            'SELECT id, rating, message, created_at FROM feedbacks WHERE business_id = $1 AND is_positive = false AND notified = false ORDER BY created_at DESC LIMIT 5',
            [id]
        );

        res.json({
            unreadCount: unreadFeedbacks?.length || 0,
            newNegative: newNegative || []
        });
    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
});

/**
 * POST /api/business/:id/alerts/mark-notified
 * Mark feedbacks as notified (for extension)
 */
router.post('/:id/alerts/mark-notified', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { feedbackIds } = req.body;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!feedbackIds || !Array.isArray(feedbackIds)) {
            return res.status(400).json({ error: 'feedbackIds array required' });
        }

        // Build parameterized IN clause
        const placeholders = feedbackIds.map((_, i) => `$${i + 1}`).join(', ');
        const { rowCount } = await query(
            `UPDATE feedbacks SET notified = true WHERE id IN (${placeholders}) AND business_id = $${feedbackIds.length + 1}`,
            [...feedbackIds, id]
        );

        res.json({ success: true, marked: rowCount });
    } catch (error) {
        console.error('Mark notified error:', error);
        res.status(500).json({ error: 'Failed to mark as notified' });
    }
});

/**
 * GET /api/business/:id/analytics
 * Get analytics data for charts (authenticated)
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { range, startDate, endDate } = req.query;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized to access this business' });
        }

        const now = new Date();
        let fromDate, toDate = now;
        let groupBy = 'day';

        if (range === 'week') {
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupBy = 'day';
        } else if (range === 'month') {
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            groupBy = 'day';
        } else if (range === 'year') {
            fromDate = new Date(now.getFullYear(), 0, 1);
            groupBy = 'month';
        } else if (range === 'custom' && startDate && endDate) {
            fromDate = new Date(startDate);
            toDate = new Date(endDate);
            const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
            if (daysDiff > 180) groupBy = 'month';
            else if (daysDiff > 60) groupBy = 'week';
            else groupBy = 'day';
        } else {
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupBy = 'day';
        }

        // Fetch all feedbacks in range
        const { rows: feedbacks } = await query(
            `SELECT rating, is_positive, created_at, message, owner_reply, replied_at, ai_sentiment, ai_confidence, source
             FROM feedbacks
             WHERE business_id = $1 AND created_at >= $2 AND created_at <= $3
             ORDER BY created_at ASC`,
            [id, fromDate.toISOString(), toDate.toISOString()]
        );

        // Group data by date
        const groupedData = {};
        const labels = [];

        // Generate all date labels in range
        const currentDate = new Date(fromDate);
        while (currentDate <= toDate) {
            let label;
            if (groupBy === 'day') {
                label = currentDate.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekStart = new Date(currentDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                label = `Week ${weekStart.toISOString().split('T')[0]}`;
            } else {
                label = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!labels.includes(label)) {
                labels.push(label);
                groupedData[label] = { positive: 0, negative: 0, total: 0, ratings: [] };
            }

            if (groupBy === 'day') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (groupBy === 'week') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        // Populate with actual data
        feedbacks.forEach(feedback => {
            const date = new Date(feedback.created_at);
            let label;
            if (groupBy === 'day') {
                label = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                label = `Week ${weekStart.toISOString().split('T')[0]}`;
            } else {
                label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (groupedData[label]) {
                groupedData[label].total++;
                groupedData[label].ratings.push(feedback.rating);
                if (feedback.is_positive) {
                    groupedData[label].positive++;
                } else {
                    groupedData[label].negative++;
                }
            }
        });

        // Calculate averages and format for chart
        let cumulativeTotal = 0;
        const chartData = labels.map(label => {
            const data = groupedData[label];
            const avg = data.ratings.length > 0
                ? (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
                : 0;
            cumulativeTotal += data.total;

            let displayLabel = label;
            if (groupBy === 'day') {
                const d = new Date(label);
                displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (groupBy === 'month') {
                const [year, month] = label.split('-');
                const d = new Date(year, parseInt(month) - 1);
                displayLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            return {
                date: label,
                label: displayLabel,
                total: data.total,
                positive: data.positive,
                negative: data.negative,
                avgRating: parseFloat(avg),
                cumulative: cumulativeTotal,
                positiveRate: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0
            };
        });

        // Calculate summary stats
        const totalFeedback = feedbacks.length;
        const totalPositive = feedbacks.filter(f => f.is_positive).length;
        const totalNegative = totalFeedback - totalPositive;
        const avgRating = totalFeedback > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
            : 0;

        // Rating distribution
        const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
            star,
            name: `${star} ★`,
            count: feedbacks.filter(f => f.rating === star).length,
            percentage: totalFeedback > 0 ? Math.round((feedbacks.filter(f => f.rating === star).length / totalFeedback) * 100) : 0
        }));

        // Hourly activity heatmap
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hourlyHeatmap = [];
        const heatmapGrid = {};
        feedbacks.forEach(f => {
            const d = new Date(f.created_at);
            const day = d.getDay();
            const hour = d.getHours();
            const key = `${day}-${hour}`;
            heatmapGrid[key] = (heatmapGrid[key] || 0) + 1;
        });
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const key = `${day}-${hour}`;
                hourlyHeatmap.push({
                    day: dayNames[day],
                    dayIndex: day,
                    hour,
                    hourLabel: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
                    count: heatmapGrid[key] || 0
                });
            }
        }

        // Response metrics
        const repliedCount = feedbacks.filter(f => f.owner_reply).length;
        const responseRate = totalFeedback > 0 ? Math.round((repliedCount / totalFeedback) * 100) : 0;
        let avgResponseTimeHours = null;
        const repliedFbs = feedbacks.filter(f => f.owner_reply && f.replied_at && f.created_at);
        if (repliedFbs.length > 0) {
            const totalHours = repliedFbs.reduce((sum, f) => {
                return sum + ((new Date(f.replied_at) - new Date(f.created_at)) / (1000 * 60 * 60));
            }, 0);
            avgResponseTimeHours = parseFloat((totalHours / repliedFbs.length).toFixed(1));
        }

        // AI Sentiment breakdown
        const aiBreakdown = { positive: 0, negative: 0, neutral: 0, mixed: 0, noAi: 0 };
        feedbacks.forEach(f => {
            if (!f.ai_sentiment) { aiBreakdown.noAi++; return; }
            const s = f.ai_sentiment.toLowerCase();
            if (s === 'positive') aiBreakdown.positive++;
            else if (s === 'negative') aiBreakdown.negative++;
            else if (s === 'neutral') aiBreakdown.neutral++;
            else aiBreakdown.mixed++;
        });
        const aiConfidenceAvg = (() => {
            const withConf = feedbacks.filter(f => f.ai_confidence != null);
            if (withConf.length === 0) return null;
            return parseFloat((withConf.reduce((s, f) => s + f.ai_confidence, 0) / withConf.length).toFixed(1));
        })();

        // Feedback sources breakdown
        const sourceCounts = {};
        feedbacks.forEach(f => {
            const src = f.source || 'qr_code';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        });
        const sourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({
            source,
            name: source === 'qr_code' ? 'QR Code' : source === 'external' ? 'External' : source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            count,
            percentage: totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0
        })).sort((a, b) => b.count - a.count);

        // Top keywords
        const stopWords = new Set(['the', 'is', 'at', 'in', 'it', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'but', 'if', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'we', 'you', 'i', 'me', 'he', 'she', 'with', 'on', 'from', 'by', 'are', 'am', 'so', 'very', 'just', 'all', 'no', 'yes', 'also', 'too', 'more', 'much', 'than', 'then', 'about', 'up', 'out', 'what', 'which', 'who', 'when', 'where', 'how', 'here', 'there', 'really', 'get', 'got', 'us']);
        const wordCounts = {};
        feedbacks.forEach(f => {
            if (f.message) {
                f.message.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
                    if (w.length > 2 && !stopWords.has(w)) wordCounts[w] = (wordCounts[w] || 0) + 1;
                });
            }
        });
        const topKeywords = Object.entries(wordCounts)
            .filter(([_, c]) => c > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));

        // NPS Score
        const promoters = feedbacks.filter(f => f.rating >= 4).length;
        const detractors = feedbacks.filter(f => f.rating <= 2).length;
        const npsScore = totalFeedback > 0 ? Math.round(((promoters - detractors) / totalFeedback) * 100) : 0;

        res.json({
            chartData,
            summary: {
                total: totalFeedback,
                positive: totalPositive,
                negative: totalNegative,
                avgRating: parseFloat(avgRating),
                positiveRate: totalFeedback > 0 ? Math.round((totalPositive / totalFeedback) * 100) : 0,
                npsScore,
                responseRate,
                repliedCount,
                avgResponseTimeHours
            },
            ratingDistribution,
            hourlyHeatmap,
            aiSentiment: {
                breakdown: aiBreakdown,
                avgConfidence: aiConfidenceAvg,
                totalAnalyzed: totalFeedback - aiBreakdown.noAi
            },
            sourceBreakdown,
            topKeywords,
            range: {
                from: fromDate.toISOString(),
                to: toDate.toISOString(),
                groupBy
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics data' });
    }
});

// ==================== EXTERNAL FEEDBACK SUMMARIES ====================

/**
 * POST /api/business/:id/external-summaries
 * Save an external feedback summary (Google Form, Google Review, etc.)
 */
router.post('/:id/external-summaries', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;
        const { sourceType, title, rawText } = req.body;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ error: 'Feedback text is required' });
        }

        const summaryId = uuidv4();
        try {
            await query(
                `INSERT INTO external_summaries (id, business_id, source_type, title, raw_text, is_analyzed)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [summaryId, id, sourceType || 'other',
                 title || `${sourceType || 'External'} Feedback - ${new Date().toLocaleDateString()}`,
                 rawText.trim(), false]
            );
        } catch (insertError) {
            console.error('Insert external summary error:', insertError);
            return res.status(500).json({ error: 'Failed to save summary. Please ensure the external_summaries table exists.' });
        }

        res.status(201).json({
            message: 'Summary saved successfully',
            summary: {
                id: summaryId,
                source_type: sourceType || 'other',
                title: title || `${sourceType || 'External'} Feedback`,
                is_analyzed: false
            }
        });
    } catch (error) {
        console.error('Save external summary error:', error);
        res.status(500).json({ error: 'Failed to save summary' });
    }
});

/**
 * GET /api/business/:id/external-summaries
 * Get all saved external summaries for a business
 */
router.get('/:id/external-summaries', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rows: summaries } = await query(
            `SELECT id, source_type, title, overall_sentiment, overall_score, positive_count, negative_count,
                    total_reviews_found, is_analyzed, analyzed_at, created_at
             FROM external_summaries
             WHERE business_id = $1
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({ summaries: summaries || [] });
    } catch (error) {
        console.error('Get summaries error:', error);
        res.status(500).json({ error: 'Failed to fetch summaries' });
    }
});

/**
 * GET /api/business/:id/external-summaries/:summaryId
 * Get a single summary with full analysis result
 */
router.get('/:id/external-summaries/:summaryId', authenticate, async (req, res) => {
    try {
        const { id, summaryId } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rows } = await query(
            'SELECT * FROM external_summaries WHERE id = $1 AND business_id = $2',
            [summaryId, id]
        );

        const summary = rows[0];

        if (!summary) {
            return res.status(404).json({ error: 'Summary not found' });
        }

        res.json({ summary });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

/**
 * POST /api/business/:id/external-summaries/:summaryId/analyze
 * Analyze a saved summary with AI (can re-analyze)
 */
router.post('/:id/external-summaries/:summaryId/analyze', authenticate, async (req, res) => {
    try {
        const { id, summaryId } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Fetch the summary
        const { rows } = await query(
            'SELECT * FROM external_summaries WHERE id = $1 AND business_id = $2',
            [summaryId, id]
        );

        const summary = rows[0];

        if (!summary) {
            return res.status(404).json({ error: 'Summary not found' });
        }

        console.log(`[analyze-summary] Analyzing summary ${summaryId} (${summary.source_type})...`);

        // Run AI analysis
        const analysis = await analyzeBulkSummary(summary.raw_text, summary.source_type);

        // Update the summary with analysis results
        await query(
            `UPDATE external_summaries SET
                analysis_result = $1, overall_sentiment = $2, overall_score = $3,
                positive_count = $4, negative_count = $5, total_reviews_found = $6,
                is_analyzed = true, analyzed_at = $7, updated_at = $8
             WHERE id = $9`,
            [JSON.stringify(analysis), analysis.overallSentiment, analysis.overallScore,
             analysis.positiveCount, analysis.negativeCount, analysis.totalFound,
             new Date().toISOString(), new Date().toISOString(), summaryId]
        );

        // Also save individual feedbacks to the main feedbacks table
        let savedCount = 0;
        if (analysis.feedbacks && analysis.feedbacks.length > 0) {
            for (const fb of analysis.feedbacks) {
                const feedbackId = uuidv4();
                const fbRating = Math.min(5, Math.max(1, fb.rating || 3));
                const fbIsPositive = fb.sentiment === 'positive' || fbRating >= 4;

                try {
                    await query(
                        `INSERT INTO feedbacks (id, business_id, rating, message, is_positive, notified, source, ai_sentiment, ai_confidence)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [feedbackId, id, fbRating, fb.text || fb.summary || 'External feedback',
                         fbIsPositive, false, summary.source_type || 'external', fb.sentiment, fb.confidence]
                    );
                    savedCount++;
                } catch (insertError) {
                    // Skip individual failures
                }
            }
        }

        console.log(`[analyze-summary] Analysis complete. Found ${analysis.totalFound} feedbacks, saved ${savedCount} to dashboard.`);

        res.json({
            message: 'Analysis complete',
            analysis,
            savedCount
        });
    } catch (error) {
        console.error('Analyze summary error:', error);
        res.status(500).json({ error: 'Failed to analyze summary' });
    }
});

/**
 * DELETE /api/business/:id/external-summaries/:summaryId
 * Delete a saved summary
 */
router.delete('/:id/external-summaries/:summaryId', authenticate, async (req, res) => {
    try {
        const { id, summaryId } = req.params;
        const { businessId } = req.user;

        if (id !== businessId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rowCount } = await query(
            'DELETE FROM external_summaries WHERE id = $1 AND business_id = $2',
            [summaryId, id]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to delete summary' });
        }

        res.json({ message: 'Summary deleted' });
    } catch (error) {
        console.error('Delete summary error:', error);
        res.status(500).json({ error: 'Failed to delete summary' });
    }
});

export default router;
