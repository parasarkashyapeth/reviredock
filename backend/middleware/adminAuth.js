import { supabase } from '../db/supabase.js';

/**
 * Admin authentication middleware
 * Checks that the authenticated user has is_admin = true
 * Must be used AFTER the regular authenticate middleware
 */
export const requireAdmin = async (req, res, next) => {
    try {
        const { userId } = req.user;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!user.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Authorization check failed' });
    }
};
