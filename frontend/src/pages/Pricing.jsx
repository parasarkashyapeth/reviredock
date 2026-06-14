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

    // Coupon state: { [planId]: { code, validating, result, error } }
    const [coupons, setCoupons] = useState({})

    const getCouponState = (planId) => coupons[planId] || { code: '', validating: false, result: null, error: null }

    const updateCoupon = (planId, patch) => setCoupons(prev => ({
        ...prev,
        [planId]: { ...getCouponState(planId), ...patch }
    }))

    const handleCouponChange = (planId, value) => {
        updateCoupon(planId, { code: value, result: null, error: null })
    }

    const validateCoupon = async (planId) => {
        const { code } = getCouponState(planId)
        if (!code.trim()) return
        updateCoupon(planId, { validating: true, result: null, error: null })
        try {
            const res = await fetch(`${API_URL}/api/payment/validate-coupon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode: code.trim(), planId }),
            })
            const data = await res.json()
            if (res.ok) {
                updateCoupon(planId, { validating: false, result: data, error: null })
            } else {
                updateCoupon(planId, { validating: false, result: null, error: data.error || 'Invalid code' })
            }
        } catch {
            updateCoupon(planId, { validating: false, result: null, error: 'Could not validate code' })
        }
    }

    const clearCoupon = (planId) => updateCoupon(planId, { code: '', result: null, error: null })

    useEffect(() => {
        fetchPlanInfo()
    }, [])

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
            originalPrice: '₹399',
            discountPct: '25% OFF',
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
            originalPrice: '₹3,599',
            discountPct: '17% OFF',
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

        try {
            const token = getToken()
            const couponCode = getCouponState(planId).result?.couponCode || ''

            // 1. Create a Razorpay Payment Link on the backend
            const res = await fetch(`${API_URL}/api/payment/create-payment-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId, couponCode }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to create payment link')
            }

            const data = await res.json()

            // 2. Store the reference ID for the callback page to use
            localStorage.setItem('rdock_payment_ref', data.referenceId)

            // 3. Redirect to Razorpay's hosted payment page (no domain whitelisting needed!)
            window.location.href = data.paymentLinkUrl

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
                    {/* Offer Banner */}
                    <div
                        className="inline-flex items-center gap-3 mb-6 px-5 py-3 rounded-2xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(251,146,60,0.15) 0%, rgba(239,68,68,0.1) 100%)',
                            border: '1px solid rgba(251,146,60,0.35)',
                            boxShadow: '0 0 30px rgba(251,146,60,0.15)',
                            animation: 'pulse 2.5s ease-in-out infinite',
                        }}
                    >
                        <span className="text-xl">🔥</span>
                        <div className="text-left">
                            <p className="text-sm font-bold text-orange-300">Launch Offer — Up to 25% OFF</p>
                            <p className="text-xs text-orange-300/80">Prices increasing soon · Lock in your rate today!</p>
                        </div>
                        <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(251,146,60,0.25)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)' }}
                        >
                            ENDING SOON
                        </span>
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
                        Choose Your Plan
                    </h1>
                    <p className="text-white/60">Simple, transparent pricing for your business</p>
                </div>

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
                                <div className="mt-2 flex items-baseline justify-center gap-2 flex-wrap">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-white/50">{plan.period}</span>
                                    {plan.originalPrice && !plan.isCurrent && (
                                        <span className="flex items-center gap-1.5 ml-2">
                                            <s className="text-white/30 text-sm font-medium">{plan.originalPrice}</s>
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, rgba(251,146,60,0.2) 0%, rgba(239,68,68,0.2) 100%)', 
                                                    color: '#fb923c', 
                                                    border: '1px solid rgba(251,146,60,0.4)',
                                                    boxShadow: '0 0 10px rgba(251,146,60,0.1)'
                                                }}
                                            >{plan.discountPct}</span>
                                        </span>
                                    )}
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

                            {/* ── Coupon Code Input (paid plans only) ── */}
                            {plan.planId !== 'free' && !plan.isCurrent && (() => {
                                const cs = getCouponState(plan.planId)
                                return (
                                    <div className="mb-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={cs.code}
                                                onChange={e => handleCouponChange(plan.planId, e.target.value.toUpperCase())}
                                                onKeyDown={e => e.key === 'Enter' && validateCoupon(plan.planId)}
                                                placeholder="Coupon code"
                                                maxLength={20}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: cs.result
                                                        ? '1px solid rgba(34,197,94,0.5)'
                                                        : cs.error
                                                            ? '1px solid rgba(239,68,68,0.5)'
                                                            : '1px solid rgba(255,255,255,0.15)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: '#fff',
                                                    fontSize: '13px',
                                                    outline: 'none',
                                                    letterSpacing: '0.05em',
                                                    fontWeight: 600,
                                                }}
                                            />
                                            {cs.result ? (
                                                <button
                                                    onClick={() => clearCoupon(plan.planId)}
                                                    style={{
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        background: 'rgba(239,68,68,0.1)',
                                                        color: '#f87171',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => validateCoupon(plan.planId)}
                                                    disabled={!cs.code.trim() || cs.validating}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(102,126,234,0.4)',
                                                        background: 'rgba(102,126,234,0.15)',
                                                        color: '#a5b4fc',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        cursor: cs.code.trim() ? 'pointer' : 'default',
                                                        whiteSpace: 'nowrap',
                                                        opacity: cs.code.trim() ? 1 : 0.45,
                                                    }}
                                                >
                                                    {cs.validating ? '...' : 'Apply'}
                                                </button>
                                            )}
                                        </div>
                                        {/* Coupon feedback */}
                                        {cs.result && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                background: 'rgba(34,197,94,0.1)',
                                                border: '1px solid rgba(34,197,94,0.25)',
                                                fontSize: '12px',
                                                color: '#4ade80',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}>
                                                <span>🎉</span>
                                                <span>
                                                    <strong>{cs.result.discountPct}% OFF</strong> — saves {cs.result.discountAmountDisplay}!
                                                    Pay {cs.result.finalAmountDisplay} instead of <s style={{ opacity: 0.6 }}>{cs.result.originalAmountDisplay}</s>
                                                </span>
                                            </div>
                                        )}
                                        {cs.error && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                background: 'rgba(239,68,68,0.08)',
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                fontSize: '12px',
                                                color: '#f87171',
                                            }}>
                                                ❌ {cs.error}
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

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
                                        Redirecting...
                                    </span>
                                ) : (() => {
                                    const cs = getCouponState(plan.planId)
                                    if (cs.result && plan.planId !== 'free' && !plan.isCurrent) {
                                        return `Pay ${cs.result.finalAmountDisplay}`
                                    }
                                    return plan.buttonText
                                })()}
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
