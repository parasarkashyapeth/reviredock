import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/neon.js';
import { generateToken, generateRefreshToken, verifyRefreshToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { generateOTP, sendOTPEmail } from '../services/email.js';
import { isValidEmail, isStrongPassword, truncate } from '../middleware/sanitize.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Send OTP verification code to email
 */
router.post('/send-otp', authLimiter, async (req, res) => {
    try {
        const { email, businessName } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }

        // SECURITY: always respond the same way to prevent email enumeration
        const genericResponse = {
            message: 'If this email is available, a verification code has been sent',
            expiresIn: 600
        };

        // Check if email already exists
        const { rows: existingUsers } = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            // Don't reveal that email exists — return same generic message
            return res.json(genericResponse);
        }

        // Invalidate any existing OTPs for this email
        await query(
            'UPDATE email_verification_otps SET verified = true WHERE email = $1 AND verified = false',
            [email.toLowerCase()]
        );

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        const { rowCount } = await query(
            'INSERT INTO email_verification_otps (email, otp_code, expires_at, verified, attempts) VALUES ($1, $2, $3, $4, $5)',
            [email.toLowerCase(), otp, expiresAt.toISOString(), false, 0]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to generate OTP' });
        }

        // Send OTP email
        await sendOTPEmail(email, otp, businessName);

        res.json({
            message: 'Verification code sent to your email',
            expiresIn: 600 // 10 minutes in seconds
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send verification code', debug: error.message, stack: error.stack?.split('\n').slice(0, 3) });
    }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP code
 */
router.post('/verify-otp', authLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Find valid OTP
        const { rows: otpRows } = await query(
            'SELECT * FROM email_verification_otps WHERE email = $1 AND otp_code = $2 AND verified = false ORDER BY created_at DESC LIMIT 1',
            [email.toLowerCase(), otp]
        );

        const otpRecord = otpRows[0];

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // Check attempts (max 5)
        if (otpRecord.attempts >= 5) {
            return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
        }

        // Increment attempts
        await query(
            'UPDATE email_verification_otps SET attempts = $1 WHERE id = $2',
            [otpRecord.attempts + 1, otpRecord.id]
        );

        // Mark as verified
        await query(
            'UPDATE email_verification_otps SET verified = true WHERE id = $1',
            [otpRecord.id]
        );

        res.json({
            verified: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify code' });
    }
});

/**
 * POST /api/auth/signup
 * Register a new business owner
 */
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { email, password, businessName, category, googleReviewUrl, ownerName, profilePictureUrl, reviewPlatforms, googleId } = req.body;

        // Validation - review platforms are now optional
        const hasReviewPlatforms = Array.isArray(reviewPlatforms) && reviewPlatforms.length > 0;
        const hasLegacyUrl = googleReviewUrl && googleReviewUrl.trim();

        // Password is required unless signing up with Google (googleId provided)
        const isGoogleSignup = !!googleId;

        if (!email || !businessName || !category) {
            return res.status(400).json({ error: 'Email, business name, and category are required' });
        }

        // Password validation only for non-Google signups
        if (!isGoogleSignup) {
            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }
            if (!isStrongPassword(password)) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters with uppercase, lowercase, and a number'
                });
            }
        }

        // SECURITY: Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // SECURITY: Truncate/validate business name length
        if (businessName.length > 200) {
            return res.status(400).json({ error: 'Business name is too long' });
        }

        // Check if email already exists
        const { rows: existingUsers } = await query(
            'SELECT id, google_id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        const existingUser = existingUsers[0];

        if (existingUser) {
            if (existingUser.google_id) {
                return res.status(400).json({ error: 'An account with this email already exists via Google. Please sign in with Google instead.' });
            }
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password (only if provided)
        let passwordHash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(password, salt);
        }

        // Generate IDs
        const businessId = uuidv4();
        const userId = uuidv4();

        // Create business
        try {
            await query(
                'INSERT INTO businesses (id, name, category, google_review_url, subscription_plan, monthly_feedback_limit, monthly_feedback_count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [businessId, businessName, category, googleReviewUrl, 'free', 50, 0]
            );
        } catch (businessError) {
            console.error('Business creation error:', businessError);
            return res.status(500).json({ error: 'Failed to create business' });
        }

        // Create user
        try {
            await query(
                'INSERT INTO users (id, email, password_hash, business_id, owner_name, profile_picture_url, google_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, email.toLowerCase(), passwordHash, businessId, ownerName || null, profilePictureUrl || null, googleId || null]
            );
        } catch (userError) {
            console.error('User creation error:', userError);
            // Rollback business creation
            await query('DELETE FROM businesses WHERE id = $1', [businessId]);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // Insert review platforms if provided
        if (hasReviewPlatforms) {
            for (let idx = 0; idx < reviewPlatforms.length; idx++) {
                const p = reviewPlatforms[idx];
                try {
                    await query(
                        'INSERT INTO review_platforms (business_id, platform_name, platform_label, url, is_primary, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                        [businessId, p.platform || 'custom', p.label || p.platform || 'Review Link', p.url, p.isPrimary || idx === 0, true]
                    );
                } catch (platformError) {
                    console.error('Review platforms insert error:', platformError);
                    // Don't fail signup, just log the error
                }
            }
        }

        // Generate JWT
        const token = generateToken({ userId, businessId });
        const refreshToken = generateRefreshToken({ userId, businessId });

        res.status(201).json({
            message: 'Account created successfully',
            token,
            refreshToken,
            user: {
                id: userId,
                email: email.toLowerCase(),
                businessId,
                businessName,
                ownerName: ownerName || null,
                profilePictureUrl: profilePictureUrl || null,
                isAdmin: false,
                isGoogleAccount: !!googleId
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user with business info
        const { rows } = await query(
            `SELECT u.*, b.name as business_name, b.category as business_category,
                    b.subscription_plan, b.logo_url as business_logo_url
             FROM users u
             JOIN businesses b ON u.business_id = b.id
             WHERE u.email = $1`,
            [email.toLowerCase()]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = generateToken({ userId: user.id, businessId: user.business_id });
        const refreshToken = generateRefreshToken({ userId: user.id, businessId: user.business_id });

        res.json({
            message: 'Login successful',
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                businessId: user.business_id,
                businessName: user.business_name,
                ownerName: user.owner_name || null,
                profilePictureUrl: user.profile_picture_url || null,
                isAdmin: user.is_admin || false,
                isGoogleAccount: !!user.google_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

/**
 * POST /api/auth/google
 * Sign in or sign up via native Google OAuth
 * Accepts a Google ID token (credential) from Google Identity Services
 */
router.post('/google', authLimiter, async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify the Google ID token
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError.message);
            return res.status(401).json({ error: 'Invalid Google credential' });
        }

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name || email.split('@')[0];
        const picture = payload.picture || null;
        const googleId = payload.sub;

        if (!payload.email_verified) {
            return res.status(400).json({ error: 'Google email not verified' });
        }

        // Check if user already exists
        const { rows } = await query(
            `SELECT u.*, b.name as business_name, b.category as business_category,
                    b.subscription_plan, b.logo_url as business_logo_url
             FROM users u
             JOIN businesses b ON u.business_id = b.id
             WHERE u.email = $1`,
            [email.toLowerCase()]
        );

        const existingUser = rows[0];

        if (existingUser) {
            // User exists - log them in
            // Update profile picture if changed
            if (picture && picture !== existingUser.profile_picture_url) {
                await query(
                    'UPDATE users SET profile_picture_url = $1 WHERE id = $2',
                    [picture, existingUser.id]
                );
            }

            // Update google_id if not set
            if (googleId && !existingUser.google_id) {
                await query(
                    'UPDATE users SET google_id = $1 WHERE id = $2',
                    [googleId, existingUser.id]
                );
            }

            const token = generateToken({ userId: existingUser.id, businessId: existingUser.business_id });

            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    businessId: existingUser.business_id,
                    businessName: existingUser.business_name,
                    ownerName: existingUser.owner_name || name,
                    profilePictureUrl: picture || existingUser.profile_picture_url,
                    isAdmin: existingUser.is_admin || false,
                    isGoogleAccount: !!existingUser.google_id
                },
                isNewUser: false
            });
        }

        // New user — needs to complete signup
        // Return their Google profile data so the frontend can prefill the signup form
        return res.json({
            needsSignup: true,
            email,
            name,
            picture,
            googleId,
            message: 'Please complete your business registration'
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
});


/**
 * GET /api/auth/me
 * Get current user info (protected)
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const { userId } = req.user;

        const { rows } = await query(
            `SELECT u.*, b.name as business_name, b.category as business_category,
                    b.subscription_plan, b.logo_url as business_logo_url
             FROM users u
             JOIN businesses b ON u.business_id = b.id
             WHERE u.id = $1`,
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            businessId: user.business_id,
            businessName: user.business_name,
            ownerName: user.owner_name || null,
            profilePictureUrl: user.profile_picture_url || null,
            isAdmin: user.is_admin || false,
            isGoogleAccount: !!user.google_id
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset - generates token and returns it
 * In production, this should send an email instead
 */
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const { rows } = await query(
            'SELECT id, email FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = rows[0];

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({
                message: 'If an account with that email exists, a password reset link has been generated.',
            });
        }

        // Invalidate any existing tokens for this user
        await query(
            'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
            [user.id]
        );

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store token in database
        try {
            await query(
                'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES ($1, $2, $3, $4)',
                [user.id, resetToken, expiresAt.toISOString(), false]
            );
        } catch (tokenError) {
            console.error('Token creation error:', tokenError);
            return res.status(500).json({ error: 'Failed to create reset token' });
        }

        // SECURITY: Never return the token in response — send via email only
        // TODO: Wire up sendPasswordResetEmail(email, resetToken) when SMTP is configured
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', authLimiter, async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, and a number'
            });
        }

        // Find valid token
        const { rows } = await query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false',
            [token]
        );

        const resetToken = rows[0];

        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date(resetToken.expires_at) < new Date()) {
            // Mark token as used
            await query(
                'UPDATE password_reset_tokens SET used = true WHERE id = $1',
                [resetToken.id]
            );
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update user password
        const { rowCount } = await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [passwordHash, resetToken.user_id]
        );

        if (rowCount === 0) {
            console.error('Password update error: no rows updated');
            return res.status(500).json({ error: 'Failed to update password' });
        }

        // Mark token as used
        await query(
            'UPDATE password_reset_tokens SET used = true WHERE id = $1',
            [resetToken.id]
        );

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

/**
 * GET /api/auth/verify-reset-token
 * Verify if a reset token is valid
 */
router.get('/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ valid: false, error: 'Token is required' });
        }

        const { rows } = await query(
            'SELECT expires_at, used FROM password_reset_tokens WHERE token = $1',
            [token]
        );

        const resetToken = rows[0];

        if (!resetToken) {
            return res.json({ valid: false, error: 'Invalid token' });
        }

        if (resetToken.used) {
            return res.json({ valid: false, error: 'Token has already been used' });
        }

        if (new Date(resetToken.expires_at) < new Date()) {
            return res.json({ valid: false, error: 'Token has expired' });
        }

        res.json({ valid: true });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ valid: false, error: 'Failed to verify token' });
    }
});

/**
 * POST /api/auth/change-password
 * Change password while logged in (requires current password)
 */
router.post('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const { userId } = req.user;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters with uppercase, lowercase, and a number'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        // Get user
        const { rows } = await query(
            'SELECT password_hash, google_id FROM users WHERE id = $1',
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Google-login users have no password_hash — guide them to Forgot Password
        if (!user.password_hash) {
            return res.status(400).json({
                error: 'Your account uses Google Sign-In and does not have a password yet. Please use the "Forgot Password" flow to set a password first.',
                isGoogleAccount: true
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // Update password
        const { rowCount } = await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [newHash, userId]
        );

        if (rowCount === 0) {
            return res.status(500).json({ error: 'Failed to update password' });
        }

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/**
 * POST /api/auth/refresh-token
 * Exchange a refresh token for a new access token
 */
router.post('/refresh-token', authLimiter, async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Verify user still exists
        const { rows } = await query(
            'SELECT id, business_id FROM users WHERE id = $1',
            [decoded.userId]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Issue new tokens
        const newAccessToken = generateToken({ userId: user.id, businessId: user.business_id });
        const newRefreshToken = generateRefreshToken({ userId: user.id, businessId: user.business_id });

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error.message);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

/**
 * GET /api/auth/emails
 * Get emails of all registered users
 */
router.get('/emails', async (req, res) => {
    try {
        const { rows: users } = await query('SELECT email FROM users');

        const emails = users.map(user => user.email);
        res.json({ emails });
    } catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({ error: 'Failed to get emails' });
    }
});

export default router;
