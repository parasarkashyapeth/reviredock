import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import API_URL from '../config/api'

const glassCard = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
}

export default function PaymentCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { getToken } = useAuth()

    const [status, setStatus] = useState('checking') // 'checking' | 'paid' | 'pending' | 'failed' | 'error'
    const [paymentInfo, setPaymentInfo] = useState(null)
    const [pollCount, setPollCount] = useState(0)
    const pollRef = useRef(null)
    const MAX_POLLS = 20 // Poll for ~60 seconds (20 × 3s)

    // Extract referenceId from localStorage (we stored it before redirecting)
    const referenceId = localStorage.getItem('rdock_payment_ref')

    useEffect(() => {
        if (!referenceId) {
            setStatus('error')
            return
        }

        // Start polling for payment status
        checkPaymentStatus()

        return () => {
            if (pollRef.current) clearTimeout(pollRef.current)
        }
    }, [])

    const checkPaymentStatus = async () => {
        try {
            const token = getToken()
            if (!token) {
                setStatus('error')
                return
            }

            const res = await fetch(`${API_URL}/api/payment/status/${referenceId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })

            if (!res.ok) {
                setStatus('error')
                return
            }

            const data = await res.json()

            if (data.status === 'paid') {
                setStatus('paid')
                setPaymentInfo(data)
                // Clean up stored reference
                localStorage.removeItem('rdock_payment_ref')
                return
            }

            if (data.status === 'failed') {
                setStatus('failed')
                localStorage.removeItem('rdock_payment_ref')
                return
            }

            // Still pending — poll again
            setPollCount(prev => {
                const nextCount = prev + 1
                if (nextCount >= MAX_POLLS) {
                    setStatus('pending') // Show "still processing" message
                    return nextCount
                }
                // Schedule next poll
                pollRef.current = setTimeout(checkPaymentStatus, 3000)
                return nextCount
            })
        } catch (err) {
            console.error('Payment status check error:', err)
            setStatus('error')
        }
    }

    const getContent = () => {
        switch (status) {
            case 'checking':
                return {
                    icon: (
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <div
                                className="w-20 h-20 rounded-full animate-spin"
                                style={{
                                    border: '3px solid rgba(102, 126, 234, 0.2)',
                                    borderTopColor: '#667eea',
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="w-10 h-10 rounded-full animate-pulse"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                                    }}
                                />
                            </div>
                        </div>
                    ),
                    title: 'Verifying Your Payment',
                    subtitle: 'Please wait while we confirm your payment with Razorpay...',
                    showProgress: true,
                }
            case 'paid':
                return {
                    icon: <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>,
                    title: 'Payment Successful!',
                    subtitle: `Welcome to ${paymentInfo?.planName || 'Pro'}! Your account has been upgraded.`,
                    extra: paymentInfo?.expiresAt && (
                        <p className="text-sm text-white/50 mt-3">
                            Valid until {new Date(paymentInfo.expiresAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    ),
                    button: { text: 'Go to Dashboard', action: () => navigate('/dashboard') },
                    style: {
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                    },
                }
            case 'pending':
                return {
                    icon: <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>,
                    title: 'Payment Still Processing',
                    subtitle: 'Your payment is being processed by Razorpay. This might take a minute. Your plan will be activated automatically once confirmed.',
                    button: { text: 'Go to Dashboard', action: () => navigate('/dashboard') },
                    secondaryButton: { text: 'Check Again', action: () => { setPollCount(0); setStatus('checking'); checkPaymentStatus() } },
                }
            case 'failed':
                return {
                    icon: <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>,
                    title: 'Payment Failed',
                    subtitle: 'Your payment could not be completed. No amount has been charged. Please try again.',
                    button: { text: 'Try Again', action: () => navigate('/pricing') },
                    style: {
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                }
            case 'error':
            default:
                return {
                    icon: <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>,
                    title: 'Something Went Wrong',
                    subtitle: 'We couldn\'t verify your payment status. If you were charged, your plan will be activated automatically within a few minutes.',
                    button: { text: 'Go to Pricing', action: () => navigate('/pricing') },
                    secondaryButton: { text: 'Go to Dashboard', action: () => navigate('/dashboard') },
                }
        }
    }

    const content = getContent()

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            {/* Background gradient */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(102, 126, 234, 0.15) 0%, transparent 60%)',
                }}
            />

            <div
                className="relative w-full max-w-md p-8 text-center animate-fadeIn"
                style={{ ...glassCard, ...(content.style || {}) }}
            >
                {content.icon}

                <h2
                    className="text-2xl font-bold mb-3"
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    {content.title}
                </h2>

                <p className="text-white/60 mb-6 leading-relaxed">
                    {content.subtitle}
                </p>

                {content.extra}

                {content.showProgress && (
                    <div className="mb-6">
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden mx-auto"
                            style={{ background: 'rgba(255, 255, 255, 0.1)', maxWidth: '200px' }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${Math.min((pollCount / MAX_POLLS) * 100, 100)}%`,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                                }}
                            />
                        </div>
                        <p className="text-xs text-white/30 mt-2">
                            Checking... ({pollCount}/{MAX_POLLS})
                        </p>
                    </div>
                )}

                {content.button && (
                    <button
                        onClick={content.button.action}
                        className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                        style={{
                            background: status === 'paid'
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.4) 100%)'
                                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                            border: status === 'paid'
                                ? '1px solid rgba(34, 197, 94, 0.5)'
                                : '1px solid rgba(102, 126, 234, 0.5)',
                            boxShadow: status === 'paid'
                                ? '0 0 20px rgba(34, 197, 94, 0.3)'
                                : '0 0 20px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        {content.button.text}
                    </button>
                )}

                {content.secondaryButton && (
                    <button
                        onClick={content.secondaryButton.action}
                        className="w-full mt-3 py-3 px-6 rounded-xl font-semibold text-white/60 transition-all duration-300 hover:text-white"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        {content.secondaryButton.text}
                    </button>
                )}

                {/* Razorpay trust badge */}
                <div className="mt-6 text-xs text-white/30 flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Secured by Razorpay</span>
                </div>
            </div>
        </div>
    )
}
