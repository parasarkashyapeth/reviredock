import express from 'express';
import { query } from '../db/neon.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All admin routes require auth + admin check
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /api/admin/stats
 * Get overview statistics for the admin dashboard
 */
router.get('/stats', async (req, res) => {
    try {
        // Total users
        const { rows: [{ count: totalUsers }] } = await query('SELECT COUNT(*)::int as count FROM users');

        // Total businesses
        const { rows: [{ count: totalBusinesses }] } = await query('SELECT COUNT(*)::int as count FROM businesses');

        // Total feedbacks
        const { rows: [{ count: totalFeedbacks }] } = await query('SELECT COUNT(*)::int as count FROM feedbacks');

        // Positive feedbacks
        const { rows: [{ count: positiveFeedbacks }] } = await query('SELECT COUNT(*)::int as count FROM feedbacks WHERE is_positive = true');

        // Negative feedbacks
        const { rows: [{ count: negativeFeedbacks }] } = await query('SELECT COUNT(*)::int as count FROM feedbacks WHERE is_positive = false');

        // Users created in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { rows: [{ count: newUsersLast7Days }] } = await query(
            'SELECT COUNT(*)::int as count FROM users WHERE created_at >= $1',
            [sevenDaysAgo]
        );

        // Feedbacks in last 7 days
        const { rows: [{ count: newFeedbacksLast7Days }] } = await query(
            'SELECT COUNT(*)::int as count FROM feedbacks WHERE created_at >= $1',
            [sevenDaysAgo]
        );

        // Feedbacks in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { rows: [{ count: feedbacksLast24h }] } = await query(
            'SELECT COUNT(*)::int as count FROM feedbacks WHERE created_at >= $1',
            [oneDayAgo]
        );

        // Subscription breakdown
        const { rows: planBreakdown } = await query('SELECT subscription_plan FROM businesses');

        const plans = {};
        (planBreakdown || []).forEach(b => {
            const plan = b.subscription_plan || 'free';
            plans[plan] = (plans[plan] || 0) + 1;
        });

        // Recent signups trend (last 30 days, grouped by day)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { rows: recentUsers } = await query(
            'SELECT created_at FROM users WHERE created_at >= $1 ORDER BY created_at ASC',
            [thirtyDaysAgo]
        );

        const signupTrend = {};
        (recentUsers || []).forEach(u => {
            const day = new Date(u.created_at).toISOString().split('T')[0];
            signupTrend[day] = (signupTrend[day] || 0) + 1;
        });

        // Recent feedback trend (last 30 days)
        const { rows: recentFeedbacks } = await query(
            'SELECT created_at, is_positive FROM feedbacks WHERE created_at >= $1 ORDER BY created_at ASC',
            [thirtyDaysAgo]
        );

        const feedbackTrend = {};
        (recentFeedbacks || []).forEach(f => {
            const day = new Date(f.created_at).toISOString().split('T')[0];
            if (!feedbackTrend[day]) feedbackTrend[day] = { positive: 0, negative: 0 };
            if (f.is_positive) feedbackTrend[day].positive++;
            else feedbackTrend[day].negative++;
        });

        res.json({
            totalUsers: totalUsers || 0,
            totalBusinesses: totalBusinesses || 0,
            totalFeedbacks: totalFeedbacks || 0,
            positiveFeedbacks: positiveFeedbacks || 0,
            negativeFeedbacks: negativeFeedbacks || 0,
            newUsersLast7Days: newUsersLast7Days || 0,
            newFeedbacksLast7Days: newFeedbacksLast7Days || 0,
            feedbacksLast24h: feedbacksLast24h || 0,
            subscriptionPlans: plans,
            signupTrend: Object.entries(signupTrend).map(([date, count]) => ({ date, count })),
            feedbackTrend: Object.entries(feedbackTrend).map(([date, data]) => ({ date, ...data })),
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to get admin stats' });
    }
});

// ============================================
// USERS MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * List all users with pagination and search
 */
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const lim = parseInt(limit);

        let sql, countSql;
        const params = [];
        let paramIdx = 1;

        if (search) {
            const searchPattern = `%${search}%`;
            countSql = `SELECT COUNT(*)::int as count FROM users WHERE email ILIKE $1 OR owner_name ILIKE $1`;
            sql = `SELECT u.id, u.email, u.owner_name, u.profile_picture_url, u.google_id, u.is_admin, u.created_at, u.business_id,
                          b.name as business_name, b.category as business_category, b.subscription_plan
                   FROM users u
                   LEFT JOIN businesses b ON u.business_id = b.id
                   WHERE u.email ILIKE $1 OR u.owner_name ILIKE $1
                   ORDER BY u.created_at DESC
                   LIMIT $2 OFFSET $3`;
            params.push(searchPattern, lim, offset);
        } else {
            countSql = 'SELECT COUNT(*)::int as count FROM users';
            sql = `SELECT u.id, u.email, u.owner_name, u.profile_picture_url, u.google_id, u.is_admin, u.created_at, u.business_id,
                          b.name as business_name, b.category as business_category, b.subscription_plan
                   FROM users u
                   LEFT JOIN businesses b ON u.business_id = b.id
                   ORDER BY u.created_at DESC
                   LIMIT $1 OFFSET $2`;
            params.push(lim, offset);
        }

        const { rows: [{ count }] } = await query(countSql, search ? [`%${search}%`] : []);
        const { rows: users } = await query(sql, params);

        // Transform to match old format with nested businesses object
        const transformed = users.map(u => ({
            id: u.id,
            email: u.email,
            owner_name: u.owner_name,
            profile_picture_url: u.profile_picture_url,
            google_id: u.google_id,
            is_admin: u.is_admin,
            created_at: u.created_at,
            business_id: u.business_id,
            businesses: {
                name: u.business_name,
                category: u.business_category,
                subscription_plan: u.subscription_plan,
            }
        }));

        res.json({
            users: transformed,
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / lim),
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (also cascades to their business)
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // Prevent self-deletion
        if (id === userId) {
            return res.status(400).json({ error: 'Cannot delete your own admin account' });
        }

        // Get the user to find business_id before deleting
        const { rows: targetRows } = await query(
            'SELECT id, business_id FROM users WHERE id = $1',
            [id]
        );

        const targetUser = targetRows[0];

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user (cascades from business if only user)
        const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        // Check if business has other users
        const { rows: [{ count: remainingUsers }] } = await query(
            'SELECT COUNT(*)::int as count FROM users WHERE business_id = $1',
            [targetUser.business_id]
        );

        // If no more users for this business, delete the business too
        if (remainingUsers === 0) {
            await query('DELETE FROM businesses WHERE id = $1', [targetUser.business_id]);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * PATCH /api/admin/users/:id/toggle-admin
 * Toggle admin status for a user
 */
router.patch('/users/:id/toggle-admin', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // Prevent self-toggle
        if (id === userId) {
            return res.status(400).json({ error: 'Cannot change your own admin status' });
        }

        // Get current admin status
        const { rows } = await query(
            'SELECT is_admin FROM users WHERE id = $1',
            [id]
        );

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newStatus = !user.is_admin;

        const { rowCount } = await query(
            'UPDATE users SET is_admin = $1 WHERE id = $2',
            [newStatus, id]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to update admin status' });
        }

        res.json({ message: `User ${newStatus ? 'promoted to' : 'removed from'} admin`, is_admin: newStatus });
    } catch (error) {
        console.error('Admin toggle error:', error);
        res.status(500).json({ error: 'Failed to toggle admin' });
    }
});

// ============================================
// BUSINESSES MANAGEMENT
// ============================================

/**
 * GET /api/admin/businesses
 * List all businesses with pagination and search
 */
router.get('/businesses', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const lim = parseInt(limit);

        let sql, countSql;
        const params = [];

        if (search) {
            const searchPattern = `%${search}%`;
            countSql = `SELECT COUNT(*)::int as count FROM businesses WHERE name ILIKE $1 OR category ILIKE $1`;
            sql = `SELECT * FROM businesses WHERE name ILIKE $1 OR category ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            params.push(searchPattern, lim, offset);
        } else {
            countSql = 'SELECT COUNT(*)::int as count FROM businesses';
            sql = 'SELECT * FROM businesses ORDER BY created_at DESC LIMIT $1 OFFSET $2';
            params.push(lim, offset);
        }

        const { rows: [{ count }] } = await query(countSql, search ? [`%${search}%`] : []);
        const { rows: businesses } = await query(sql, params);

        // Get feedback counts per business
        const enriched = await Promise.all(
            (businesses || []).map(async (b) => {
                const { rows: [{ count: feedbackCount }] } = await query(
                    'SELECT COUNT(*)::int as count FROM feedbacks WHERE business_id = $1',
                    [b.id]
                );

                const { rows: [{ count: userCount }] } = await query(
                    'SELECT COUNT(*)::int as count FROM users WHERE business_id = $1',
                    [b.id]
                );

                return { ...b, feedbackCount: feedbackCount || 0, userCount: userCount || 0 };
            })
        );

        res.json({
            businesses: enriched,
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / lim),
        });
    } catch (error) {
        console.error('Admin get businesses error:', error);
        res.status(500).json({ error: 'Failed to get businesses' });
    }
});

/**
 * PATCH /api/admin/businesses/:id/plan
 * Update a business subscription plan
 */
router.patch('/businesses/:id/plan', async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, feedbackLimit } = req.body;

        if (!plan) {
            return res.status(400).json({ error: 'Plan is required' });
        }

        let sql, params;
        if (feedbackLimit !== undefined) {
            sql = 'UPDATE businesses SET subscription_plan = $1, monthly_feedback_limit = $2 WHERE id = $3';
            params = [plan, parseInt(feedbackLimit), id];
        } else {
            sql = 'UPDATE businesses SET subscription_plan = $1 WHERE id = $2';
            params = [plan, id];
        }

        const { rowCount } = await query(sql, params);

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to update plan' });
        }

        res.json({ message: 'Plan updated successfully' });
    } catch (error) {
        console.error('Admin update plan error:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

/**
 * DELETE /api/admin/businesses/:id
 * Delete a business and all associated data
 */
router.delete('/businesses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check the business exists
        const { rows } = await query(
            'SELECT id FROM businesses WHERE id = $1',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Delete business (cascades to users, feedbacks, platforms)
        const { rowCount } = await query('DELETE FROM businesses WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to delete business' });
        }

        res.json({ message: 'Business and all associated data deleted successfully' });
    } catch (error) {
        console.error('Admin delete business error:', error);
        res.status(500).json({ error: 'Failed to delete business' });
    }
});

// ============================================
// FEEDBACKS MANAGEMENT
// ============================================

/**
 * GET /api/admin/feedbacks
 * List all feedbacks across all businesses
 */
router.get('/feedbacks', async (req, res) => {
    try {
        const { page = 1, limit = 20, type = 'all', search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const lim = parseInt(limit);

        let conditions = [];
        const params = [];
        let paramIdx = 1;

        if (type === 'positive') {
            conditions.push(`f.is_positive = true`);
        } else if (type === 'negative') {
            conditions.push(`f.is_positive = false`);
        }

        if (search) {
            conditions.push(`f.message ILIKE $${paramIdx}`);
            params.push(`%${search}%`);
            paramIdx++;
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const { rows: [{ count }] } = await query(
            `SELECT COUNT(*)::int as count FROM feedbacks f ${whereClause}`,
            params
        );

        const { rows: feedbacks } = await query(
            `SELECT f.*, b.name as business_name
             FROM feedbacks f
             LEFT JOIN businesses b ON f.business_id = b.id
             ${whereClause}
             ORDER BY f.created_at DESC
             LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
            [...params, lim, offset]
        );

        // Transform to match old format with nested businesses
        const transformed = feedbacks.map(f => ({
            ...f,
            businesses: { name: f.business_name }
        }));

        res.json({
            feedbacks: transformed || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / lim),
        });
    } catch (error) {
        console.error('Admin get feedbacks error:', error);
        res.status(500).json({ error: 'Failed to get feedbacks' });
    }
});

/**
 * DELETE /api/admin/feedbacks/:id
 * Delete a specific feedback
 */
router.delete('/feedbacks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await query('DELETE FROM feedbacks WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to delete feedback' });
        }

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Admin delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// ============================================
// PAYMENTS MANAGEMENT
// ============================================

/**
 * GET /api/admin/payments
 * List all payments across all businesses
 */
router.get('/payments', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'all', search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const lim = parseInt(limit);

        let conditions = [];
        const params = [];
        let paramIdx = 1;

        if (status !== 'all') {
            conditions.push(`p.status = $${paramIdx}`);
            params.push(status);
            paramIdx++;
        }

        if (search) {
            conditions.push(`p.reference_id ILIKE $${paramIdx}`);
            params.push(`%${search}%`);
            paramIdx++;
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const { rows: [{ count }] } = await query(
            `SELECT COUNT(*)::int as count FROM payments p ${whereClause}`,
            params
        );

        const { rows: payments } = await query(
            `SELECT p.*, b.name as business_name, u.email as user_email, u.owner_name as user_owner_name
             FROM payments p
             LEFT JOIN businesses b ON p.business_id = b.id
             LEFT JOIN users u ON p.user_id = u.id
             ${whereClause}
             ORDER BY p.created_at DESC
             LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
            [...params, lim, offset]
        );

        // Transform to match old nested format
        const transformed = payments.map(p => ({
            ...p,
            businesses: { name: p.business_name },
            users: { email: p.user_email, owner_name: p.user_owner_name }
        }));

        res.json({
            payments: transformed || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / lim),
        });
    } catch (error) {
        console.error('Admin get payments error:', error);
        res.status(500).json({ error: 'Failed to get payments' });
    }
});

export default router;
