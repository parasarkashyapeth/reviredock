import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import API_URL from '../config/api'

// Inject glass animations
const GLASS_KEYFRAMES_ID = 'glass-auth-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(GLASS_KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = GLASS_KEYFRAMES_ID;
    style.textContent = `
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glassShine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes borderGlow {
            0%, 100% { border-color: rgba(255, 255, 255, 0.1); }
            50% { border-color: rgba(255, 255, 255, 0.25); }
        }
        @keyframes pulseRing {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        googleReviewUrl: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Google OAuth states
    const [googleData, setGoogleData] = useState(null)
    const [googleLoading, setGoogleLoading] = useState(false)

    // OTP verification states
    const [showOtpStep, setShowOtpStep] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpVerified, setOtpVerified] = useState(false)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [verifyingOtp, setVerifyingOtp] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otpCountdown, setOtpCountdown] = useState(0)

    const { signup, signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Handle data passed from Google auth or other sources
    useEffect(() => {
        if (location.state?.googleData) {
            const gData = location.state.googleData
            setGoogleData(gData)
            setFormData(prev => ({
                ...prev,
                email: gData.email || '',
            }))
            // Email is verified via Google
            setOtpVerified(true)
        }
    }, [location.state])

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true)
        setError('')

        try {
            const result = await signInWithGoogle()

            if (result.needsSignup) {
                // New user — prefill and stay on this page
                setGoogleData(result.googleData)
                setFormData(prev => ({
                    ...prev,
                    email: result.googleData.email || '',
                }))
                setOtpVerified(true) // Email verified by Google
            } else {
                // Existing user — go to dashboard
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        // Reset OTP verification if email changes
        if (e.target.name === 'email') {
            setOtpVerified(false)
            setShowOtpStep(false)
            setOtp('')
            setOtpSent(false)
        }
    }

    // Send OTP to email
    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Please enter your email address')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return
        }

        setSendingOtp(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    businessName: 'New Business'
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP')
            }

            setOtpSent(true)
            setShowOtpStep(true)
            setOtpCountdown(60)

            const interval = setInterval(() => {
                setOtpCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSendingOtp(false)
        }
    }

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit code')
            return
        }

        setVerifyingOtp(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Invalid verification code')
            }

            setOtpVerified(true)
            setShowOtpStep(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setVerifyingOtp(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Check if email is verified (skip for Google users)
        if (!otpVerified && !googleData) {
            setError('Please verify your email address first')
            return
        }

        // Password validation only for non-Google signups
        if (!googleData) {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                return
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
        }

        setLoading(true)

        try {
            // Create account with a placeholder business name
            // The ProfileSetup page (step 2) will update these
            const signupData = {
                businessName: 'My Business',
                category: 'Other',
                googleReviewUrl: formData.googleReviewUrl.trim() || '',
                email: formData.email,
                password: googleData ? null : formData.password,
                ownerName: googleData?.name || null,
                profilePictureUrl: googleData?.picture || null,
                reviewPlatforms: [],
                googleId: googleData?.googleId || googleData?.sub || null
            }

            await signup(signupData)

            // Navigate to profile setup (step 2) instead of welcome
            navigate('/profile-setup')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-black">
            {/* Animated Threads Background Removed */}

            {/* Glass Card Container */}
            <div
                className="w-full max-w-md relative z-10"
                style={{
                    animation: 'fadeInUp 0.8s ease-out',
                }}
            >
                {/* Glow Effect Behind Card */}
                <div
                    className="absolute inset-0 -z-10 blur-3xl opacity-50"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.2) 50%, transparent 70%)',
                        transform: 'scale(1.2)',
                    }}
                />

                {/* Glass Card */}
                <div
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                >


                    {/* Header */}
                    <div className="text-center mb-6 relative">
                        {/* Step indicator */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                    color: '#a5b4fc',
                                }}
                            >1</div>
                            <div className="w-8 h-px bg-white/20" />
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                }}
                            >2</div>
                        </div>

                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 6px rgba(165, 180, 252, 0.5))' }}>⚓</span>
                        </div>
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Create Account
                        </h1>
                        <p className="text-white/60">Step 1: Set up your credentials</p>
                    </div>

                    {/* Google Sign-Up Option */}
                    {!googleData && (
                        <>
                            <div className="relative mb-2">
                                <button
                                    type="button"
                                    onClick={handleGoogleSignUp}
                                    disabled={googleLoading}
                                    className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        opacity: googleLoading ? 0.7 : 1,
                                    }}
                                >
                                    {googleLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                            Connecting...
                                        </span>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                            </svg>
                                            Sign up with Google
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center mb-6 mt-4">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <span className="px-4 text-sm text-white/40">or sign up with email</span>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="relative">
                        {/* Email with OTP Verification */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Address *
                                {otpVerified && (
                                    <span className="ml-2 text-green-400 text-xs">✓ Verified</span>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: otpVerified
                                            ? '1px solid rgba(34, 197, 94, 0.5)'
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                    placeholder="you@business.com"
                                    required
                                    disabled={loading || otpVerified}
                                />
                                {!otpVerified && !googleData && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || !formData.email || otpCountdown > 0}
                                        className="px-4 py-3 rounded-xl font-medium text-white text-sm transition-all duration-300 whitespace-nowrap"
                                        style={{
                                            background: sendingOtp || !formData.email || otpCountdown > 0
                                                ? 'rgba(255, 255, 255, 0.1)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            opacity: sendingOtp || !formData.email || otpCountdown > 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {sendingOtp ? '...' : otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Verify'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* OTP Input */}
                        {showOtpStep && !otpVerified && (
                            <div className="mb-4" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Enter Verification Code
                                </label>
                                <p className="text-xs text-white/50 mb-2">
                                    We sent a 6-digit code to {formData.email}
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="flex-1 px-4 py-3 rounded-xl text-white text-center text-xl tracking-[0.5em] placeholder-white/40 transition-all duration-300 focus:outline-none font-mono"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(102, 126, 234, 0.5)',
                                        }}
                                        placeholder="000000"
                                        maxLength={6}
                                        disabled={verifyingOtp}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyingOtp || otp.length !== 6}
                                        className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-300"
                                        style={{
                                            background: verifyingOtp || otp.length !== 6
                                                ? 'rgba(255, 255, 255, 0.1)'
                                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            opacity: verifyingOtp || otp.length !== 6 ? 0.6 : 1,
                                        }}
                                    >
                                        {verifyingOtp ? (
                                            <span className="animate-spin">⏳</span>
                                        ) : (
                                            '✓'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password - only for non-Google signups */}
                        {!googleData && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                        placeholder="At least 6 characters"
                                        required={!googleData}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                        placeholder="Repeat your password"
                                        required={!googleData}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        {/* Google signup notice */}
                        {googleData && (
                            <div
                                className="mb-6 p-3 rounded-xl text-sm text-center"
                                style={{
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    color: '#86efac',
                                }}
                            >
                                <span className="mr-2">✓</span>
                                Signing up with Google ({formData.email})
                            </div>
                        )}

                        {/* Google Review Link */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                <span className="flex items-center gap-2">
                                    <span>Google Review Link</span>
                                    <span
                                        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs cursor-help"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '10px',
                                        }}
                                        title="After customers leave positive feedback, they'll be redirected to this link to leave you a Google review."
                                    >
                                        ?
                                    </span>
                                </span>
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                                    style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                </div>
                                <input
                                    type="url"
                                    name="googleReviewUrl"
                                    value={formData.googleReviewUrl}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                    placeholder="https://g.page/r/your-business/review"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                                ⭐ Customers with positive feedback will be redirected here to leave a Google review.
                                You can add or update this later in Settings.
                            </p>
                        </div>

                        {error && (
                            <div
                                className="mb-4 p-3 rounded-xl text-sm text-center"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#fca5a5',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.5)',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >

                            <span className="relative z-10">
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Continue →'
                                )}
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-white/50 mt-6">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium transition-colors"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
