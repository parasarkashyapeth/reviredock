import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import API_URL from '../config/api'

// Glass card style helper
const glassCard = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
}

export default function Pricing() {
    const { user, getToken } = useAuth()
    const [currentPlan, setCurrentPlan] = useState('free')
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [usage, setUsage] = useState({ used: 0, limit: 50 })
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(null)

    useEffect(() => {
        fetchPlanInfo()
        loadRazorpayScript()
    }, [])

    // Dynamically load Razorpay checkout script
    const loadRazorpayScript = () => {
        if (document.getElementById('razorpay-script')) return
        const script = document.createElement('script')
        script.id = 'razorpay-script'
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.head.appendChild(script)
    }

    const fetchPlanInfo = async () => {
        try {
            const token = getToken()
            const response = await fetch(`${API_URL}/api/business/${user.businessId}/plan`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setCurrentPlan(data.plan)
                setUsage({ used: data.usedThisMonth, limit: data.limit })
            }
        } catch (error) {
            console.error('Failed to fetch plan info:', error)
        } finally {
            setLoading(false)
        }
    }

    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: '/month',
            features: [
                '50 feedbacks per month',
                'QR code generation',
                'Google review redirect',
                'Basic dashboard',
            ],
            limitations: [
                'Limited feedback history',
                'No email support'
            ],
            buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
            isCurrent: currentPlan === 'free',
            planId: 'free'
        },
        {
            name: 'Pro Monthly',
            price: '₹299',
            period: '/month',
            features: [
                'Unlimited feedbacks',
                'Full complaint history',
                'Priority email support',
                'Advanced analytics',
                'Custom branding'
            ],
            limitations: [],
            buttonText: currentPlan === 'paid' ? 'Current Plan' : 'Upgrade Now',
            isCurrent: currentPlan === 'paid',
            isPopular: true,
            planId: 'pro-monthly'
        },
        {
            name: 'Pro Yearly',
            price: '₹2,999',
            period: '/year',
            savings: 'Save ₹589',
            features: [
                'Everything in Pro Monthly',
                '2 months free',
                'Priority support',
                'Early access to new features'
            ],
            limitations: [],
            buttonText: currentPlan === 'paid' ? 'Current Plan' : 'Best Value',
            isCurrent: currentPlan === 'paid',
            isPopular: false,
            planId: 'pro-yearly'
        }
    ]

    const handleUpgrade = async (planId) => {
        if (planId === 'free' || paying) return

        setPaying(true)
        setPaymentSuccess(null)

        try {
            const token = getToken()

            // 1. Create order on backend
            const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
            })

            if (!orderRes.ok) {
                const err = await orderRes.json()
                throw new Error(err.error || 'Failed to create order')
            }

            const orderData = await orderRes.json()

            // 2. Open Razorpay checkout
            if (!window.Razorpay) {
                throw new Error('Payment gateway is loading. Please try again.')
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'ReviewDock',
                description: `${orderData.planName} Subscription`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    // 3. Verify payment on backend
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        })

                        const verifyData = await verifyRes.json()

                        if (verifyRes.ok) {
                            setPaymentSuccess({
                                plan: verifyData.planName,
                                expiresAt: verifyData.expiresAt,
                            })
                            setCurrentPlan('paid')
                            setUsage(prev => ({ ...prev, limit: 999999 }))
                        } else {
                            throw new Error(verifyData.error || 'Verification failed')
                        }
                    } catch (err) {
                        console.error('Payment verification error:', err)
                        alert('Payment was received but verification failed. Please contact support.')
                    } finally {
                        setPaying(false)
                    }
                },
                prefill: {
                    email: user.email || '',
                    contact: '',
                },
                theme: {
                    color: '#667eea',
                    backdrop_color: 'rgba(0, 0, 0, 0.7)',
                },
                modal: {
                    ondismiss: function () {
                        setPaying(false)
                    }
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error)
                alert(`Payment failed: ${response.error.description}`)
                setPaying(false)
            })
            rzp.open()

        } catch (error) {
            console.error('Upgrade error:', error)
            alert(error.message || 'Failed to initiate payment')
            setPaying(false)
        }
    }

    return (
        <Layout>
            <div className="animate-fadeIn">
                <div className="text-center mb-12">
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Choose Your Plan
                    </h1>
                    <p className="text-white/60">Simple, transparent pricing for your business</p>
                </div>

                {/* Payment Success Banner */}
                {paymentSuccess && (
                    <div
                        className="p-6 mb-8 text-center"
                        style={{
                            ...glassCard,
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Welcome to {paymentSuccess.plan}!
                        </h3>
                        <p className="text-white/70">
                            Your plan is now active. Enjoy unlimited feedbacks and premium features!
                        </p>
                        {paymentSuccess.expiresAt && (
                            <p className="text-sm text-white/50 mt-2">
                                Valid until {new Date(paymentSuccess.expiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        )}
                    </div>
                )}

                {/* Current Usage */}
                {!loading && currentPlan === 'free' && (
                    <div
                        className="p-6 mb-8"
                        style={{
                            ...glassCard,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3
                                    className="font-semibold"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Your Usage This Month
                                </h3>
                                <p className="text-sm text-white/60">
                                    {usage.used} / {usage.limit} feedbacks used
                                </p>
                            </div>
                            <div
                                className="w-32 h-3 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min((usage.used / usage.limit) * 100, 100)}%`,
                                        background: usage.used >= usage.limit
                                            ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6" style={{ alignItems: 'stretch' }}>
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan.planId)}
                            className="relative cursor-pointer transition-all duration-300 p-6 flex flex-col h-full"
                            style={{
                                ...glassCard,
                                transform: selectedPlan === plan.planId ? 'scale(1.02)' : 'scale(1)',
                                border: selectedPlan === plan.planId
                                    ? '2px solid rgba(102, 126, 234, 0.6)'
                                    : plan.isPopular
                                        ? '2px solid rgba(168, 85, 247, 0.5)'
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                boxShadow: selectedPlan === plan.planId
                                    ? '0 0 40px rgba(102, 126, 234, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span
                                        className="text-white text-xs font-bold px-3 py-1 rounded-full"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                                        }}
                                    >
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3
                                    className="text-xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {plan.name}
                                </h3>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-white/50">{plan.period}</span>
                                </div>
                                {plan.savings && (
                                    <span
                                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                                        style={{
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                            color: '#4ade80',
                                        }}
                                    >
                                        {plan.savings}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-white/70">
                                        <span className="text-green-400 mr-2">✓</span>
                                        {feature}
                                    </li>
                                ))}
                                {plan.limitations.map((limitation, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-white/40">
                                        <span className="text-white/30 mr-2">✗</span>
                                        {limitation}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!plan.isCurrent && plan.planId !== 'free') handleUpgrade(plan.planId)
                                }}
                                disabled={plan.isCurrent || paying}
                                className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                                style={plan.isCurrent ? {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    cursor: 'not-allowed',
                                } : plan.planId === 'free' ? {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    cursor: 'default',
                                } : plan.isPopular ? {
                                    background: paying
                                        ? 'rgba(102, 126, 234, 0.2)'
                                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                    color: 'white',
                                    boxShadow: paying ? 'none' : '0 0 20px rgba(102, 126, 234, 0.3)',
                                    cursor: paying ? 'wait' : 'pointer',
                                } : {
                                    background: paying
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    cursor: paying ? 'wait' : 'pointer',
                                }}
                            >
                                {paying ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                        Processing...
                                    </span>
                                ) : plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-white/40 mb-4">Trusted by 500+ businesses on ReviewDock</p>
                    <div className="flex justify-center items-center gap-6 text-white/50">
                        <span>🔒 Secure Payments</span>
                        <span>💳 Razorpay Protected</span>
                        <span>📞 24/7 Support</span>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
