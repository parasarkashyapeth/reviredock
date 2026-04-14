import express from 'express';
import { supabase } from '../db/supabase.js';
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
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Total businesses
        const { count: totalBusinesses } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });

        // Total feedbacks
        const { count: totalFeedbacks } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact', head: true });

        // Positive feedbacks
        const { count: positiveFeedbacks } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact', head: true })
            .eq('is_positive', true);

        // Negative feedbacks
        const { count: negativeFeedbacks } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact', head: true })
            .eq('is_positive', false);

        // Users created in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: newUsersLast7Days } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo);

        // Feedbacks in last 7 days
        const { count: newFeedbacksLast7Days } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo);

        // Feedbacks in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: feedbacksLast24h } = await supabase
            .from('feedbacks')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneDayAgo);

        // Subscription breakdown
        const { data: planBreakdown } = await supabase
            .from('businesses')
            .select('subscription_plan');

        const plans = {};
        (planBreakdown || []).forEach(b => {
            const plan = b.subscription_plan || 'free';
            plans[plan] = (plans[plan] || 0) + 1;
        });

        // Recent signups trend (last 30 days, grouped by day)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentUsers } = await supabase
            .from('users')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo)
            .order('created_at', { ascending: true });

        const signupTrend = {};
        (recentUsers || []).forEach(u => {
            const day = u.created_at.split('T')[0];
            signupTrend[day] = (signupTrend[day] || 0) + 1;
        });

        // Recent feedback trend (last 30 days)
        const { data: recentFeedbacks } = await supabase
            .from('feedbacks')
            .select('created_at, is_positive')
            .gte('created_at', thirtyDaysAgo)
            .order('created_at', { ascending: true });

        const feedbackTrend = {};
        (recentFeedbacks || []).forEach(f => {
            const day = f.created_at.split('T')[0];
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

        let query = supabase
            .from('users')
            .select('id, email, owner_name, profile_picture_url, google_id, is_admin, created_at, business_id, businesses(name, category, subscription_plan)', { count: 'exact' });

        if (search) {
            query = query.or(`email.ilike.%${search}%,owner_name.ilike.%${search}%`);
        }

        const { data: users, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) {
            console.error('Admin users query error:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json({
            users: users || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
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
        const { data: targetUser, error: findError } = await supabase
            .from('users')
            .select('id, business_id')
            .eq('id', id)
            .single();

        if (findError || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user (cascades from business if only user)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Admin delete user error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        // Check if business has other users
        const { count: remainingUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', targetUser.business_id);

        // If no more users for this business, delete the business too
        if (remainingUsers === 0) {
            await supabase.from('businesses').delete().eq('id', targetUser.business_id);
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
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', id)
            .single();

        if (findError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newStatus = !user.is_admin;

        const { error: updateError } = await supabase
            .from('users')
            .update({ is_admin: newStatus })
            .eq('id', id);

        if (updateError) {
            console.error('Admin toggle error:', updateError);
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

        let query = supabase
            .from('businesses')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
        }

        const { data: businesses, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) {
            console.error('Admin businesses query error:', error);
            return res.status(500).json({ error: 'Failed to fetch businesses' });
        }

        // Get feedback counts per business
        const businessIds = (businesses || []).map(b => b.id);
        const enriched = await Promise.all(
            (businesses || []).map(async (b) => {
                const { count: feedbackCount } = await supabase
                    .from('feedbacks')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', b.id);

                const { count: userCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', b.id);

                return { ...b, feedbackCount: feedbackCount || 0, userCount: userCount || 0 };
            })
        );

        res.json({
            businesses: enriched,
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
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

        const updateData = { subscription_plan: plan };
        if (feedbackLimit !== undefined) {
            updateData.monthly_feedback_limit = parseInt(feedbackLimit);
        }

        const { error } = await supabase
            .from('businesses')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Admin update plan error:', error);
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
        const { data: business, error: findError } = await supabase
            .from('businesses')
            .select('id')
            .eq('id', id)
            .single();

        if (findError || !business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Delete business (cascades to users, feedbacks, platforms)
        const { error: deleteError } = await supabase
            .from('businesses')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Admin delete business error:', deleteError);
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

        let query = supabase
            .from('feedbacks')
            .select('*, businesses(name)', { count: 'exact' });

        if (type === 'positive') {
            query = query.eq('is_positive', true);
        } else if (type === 'negative') {
            query = query.eq('is_positive', false);
        }

        if (search) {
            query = query.ilike('message', `%${search}%`);
        }

        const { data: feedbacks, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) {
            console.error('Admin feedbacks query error:', error);
            return res.status(500).json({ error: 'Failed to fetch feedbacks' });
        }

        res.json({
            feedbacks: feedbacks || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
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

        const { error } = await supabase
            .from('feedbacks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Admin delete feedback error:', error);
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

        let query = supabase
            .from('payments')
            .select('*, businesses(name), users(email, owner_name)', { count: 'exact' });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // We can't trivially search relation fields with simple supabase ilike without inner join,
        // so we'll just do simple filter on reference_id or plan_id for now if search is provided
        if (search) {
            query = query.ilike('reference_id', `%${search}%`);
        }

        const { data: payments, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) {
            console.error('Admin payments query error:', error);
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        res.json({
            payments: payments || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
        });
    } catch (error) {
        console.error('Admin get payments error:', error);
        res.status(500).json({ error: 'Failed to get payments' });
    }
});

export default router;
