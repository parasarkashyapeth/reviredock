import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Inject welcome page animations
const WELCOME_KEYFRAMES_ID = 'welcome-onboarding-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(WELCOME_KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = WELCOME_KEYFRAMES_ID;
    style.textContent = `
        @keyframes wb-fadeUp {
            0% { opacity: 0; transform: translateY(32px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wb-staggerIn {
            0% { opacity: 0; transform: translateX(-16px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes wb-checkBounce {
            0%   { transform: scale(0) rotate(-30deg); }
            60%  { transform: scale(1.25) rotate(6deg); }
            80%  { transform: scale(0.92) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes wb-pulseRing {
            0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.55); }
            70%  { box-shadow: 0 0 0 14px rgba(139,92,246,0); }
            100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        @keyframes wb-orb1 {
            0%,100% { transform: translate(0,0) scale(1); }
            50%      { transform: translate(40px,-30px) scale(1.15); }
        }
        @keyframes wb-orb2 {
            0%,100% { transform: translate(0,0) scale(1); }
            50%      { transform: translate(-35px,25px) scale(0.88); }
        }
        @keyframes wb-shimmer {
            0%   { background-position: -400% center; }
            100% { background-position: 400% center; }
        }
        @keyframes wb-ctaPulse {
            0%,100% { box-shadow: 0 0 24px rgba(99,102,241,0.45), 0 8px 32px rgba(139,92,246,0.3); }
            50%      { box-shadow: 0 0 40px rgba(99,102,241,0.7), 0 8px 48px rgba(139,92,246,0.5); }
        }
        .wb-step-card {
            transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .wb-step-card:hover {
            transform: translateY(-3px);
        }
        .wb-cta-btn:hover {
            transform: translateY(-2px) scale(1.02);
        }
        .wb-cta-btn:active {
            transform: translateY(0) scale(0.98);
        }
    `;
    document.head.appendChild(style);
}

const STEPS = [
    {
        num: 1,
        icon: '👤',
        title: 'Account Created',
        desc: 'You signed up and set up your business profile.',
        done: true,
    },
    {
        num: 2,
        icon: '🔗',
        title: 'Get Your Review Link',
        desc: 'Generate a unique link or QR code customers can use to leave you a review.',
        done: false,
        cta: true,
        ctaLabel: 'Get My Review Link',
        ctaHref: '/qr-code',
    },
    {
        num: 3,
        icon: '📤',
        title: 'Share With Customers',
        desc: 'Share via WhatsApp, email, or print and display the QR code at your location.',
        done: false,
    },
]

export default function Welcome() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        // Trigger entrance animation
        const t = setTimeout(() => setVisible(true), 80)
        return () => clearTimeout(t)
    }, [user, navigate])

    if (!user) return null

    const firstName = user.ownerName?.split(' ')[0] || user.businessName || 'there'

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden"
            style={{ background: '#000' }}
        >
            {/* Ambient background orbs */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: '-10%', left: '-8%',
                    width: 520, height: 520,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
                    animation: 'wb-orb1 14s ease-in-out infinite',
                    filter: 'blur(2px)',
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    bottom: '-12%', right: '-6%',
                    width: 420, height: 420,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%)',
                    animation: 'wb-orb2 11s ease-in-out infinite',
                    filter: 'blur(2px)',
                }}
            />

            {/* Main card */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 520,
                    opacity: visible ? 1 : 0,
                    animation: visible ? 'wb-fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both' : 'none',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Glow ring behind card */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        borderRadius: '2rem',
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.22) 0%, transparent 65%)',
                        filter: 'blur(24px)',
                        transform: 'scale(1.1)',
                    }}
                />

                <div
                    style={{
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '2rem',
                        padding: '2.5rem 2rem',
                        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Celebration emoji with bounce */}
                        <div style={{ fontSize: 44, marginBottom: 12, display: 'inline-block', animation: 'wb-checkBounce 0.7s ease-out 0.4s both' }}>
                            🎉
                        </div>
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 60%, #e879f9 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                lineHeight: 1.2,
                            }}
                        >
                            Welcome, {firstName}!
                        </h1>
                        <p className="text-white/55 text-sm leading-relaxed">
                            Your business profile is live. Follow these steps to start collecting reviews.
                        </p>
                    </div>

                    {/* Step list */}
                    <div className="flex flex-col gap-3 mb-8">
                        {STEPS.map((step, idx) => (
                            <div
                                key={step.num}
                                className="wb-step-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 14,
                                    padding: '1rem 1.1rem',
                                    borderRadius: '1rem',
                                    background: step.done
                                        ? 'rgba(34,197,94,0.07)'
                                        : step.cta
                                            ? 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.10) 100%)'
                                            : 'rgba(255,255,255,0.04)',
                                    border: step.done
                                        ? '1px solid rgba(34,197,94,0.25)'
                                        : step.cta
                                            ? '1px solid rgba(99,102,241,0.35)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                    animation: `wb-staggerIn 0.5s ease-out ${0.5 + idx * 0.12}s both`,
                                    cursor: step.cta ? 'pointer' : 'default',
                                }}
                                onClick={() => step.ctaHref && navigate(step.ctaHref)}
                            >
                                {/* Step icon / check */}
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: step.done ? 18 : 20,
                                        background: step.done
                                            ? 'rgba(34,197,94,0.2)'
                                            : step.cta
                                                ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.35))'
                                                : 'rgba(255,255,255,0.07)',
                                        border: step.done
                                            ? '1.5px solid rgba(34,197,94,0.45)'
                                            : step.cta
                                                ? '1.5px solid rgba(99,102,241,0.5)'
                                                : '1.5px solid rgba(255,255,255,0.12)',
                                        animation: step.cta ? 'wb-pulseRing 2.4s ease-in-out infinite' : 'none',
                                    }}
                                >
                                    {step.done ? (
                                        <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 16 }}>✓</span>
                                    ) : (
                                        <span>{step.icon}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <span
                                            style={{
                                                fontSize: 9,
                                                fontWeight: 800,
                                                letterSpacing: '0.12em',
                                                textTransform: 'uppercase',
                                                color: step.done ? 'rgba(74,222,128,0.7)' : step.cta ? 'rgba(165,180,252,0.85)' : 'rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            Step {step.num}
                                        </span>
                                        {step.done && (
                                            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(74,222,128,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                Complete
                                            </span>
                                        )}
                                        {step.cta && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                                                color: '#a5b4fc',
                                                background: 'rgba(99,102,241,0.18)',
                                                border: '1px solid rgba(99,102,241,0.35)',
                                                borderRadius: 4,
                                                padding: '1px 6px',
                                            }}>
                                                Next
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: step.done ? 'rgba(255,255,255,0.6)' : '#ffffff', marginBottom: 2 }}>
                                        {step.title}
                                    </p>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
                                        {step.desc}
                                    </p>
                                </div>

                                {/* Arrow for CTA step */}
                                {step.cta && (
                                    <div style={{ alignSelf: 'center', color: 'rgba(165,180,252,0.7)', fontSize: 18, flexShrink: 0 }}>›</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Primary CTA */}
                    <button
                        id="welcome-get-review-link-btn"
                        onClick={() => navigate('/qr-code')}
                        className="wb-cta-btn"
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            animation: 'wb-ctaPulse 2.5s ease-in-out infinite, wb-staggerIn 0.5s ease-out 0.9s both',
                            marginBottom: 12,
                            letterSpacing: '0.01em',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>🔗</span>
                        Get My Review Link
                        <span style={{ fontSize: 18, marginLeft: 2 }}>→</span>
                    </button>

                    {/* Secondary: Skip to Dashboard */}
                    <button
                        id="welcome-skip-to-dashboard-btn"
                        onClick={() => navigate('/dashboard')}
                        style={{
                            width: '100%',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.45)',
                            fontWeight: 500,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'color 0.2s ease, border-color 0.2s ease',
                            animation: 'wb-staggerIn 0.5s ease-out 1.05s both',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        }}
                    >
                        Skip — Go to Dashboard
                    </button>
                </div>

                {/* Tagline below card */}
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: 20,
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.25)',
                        animation: 'wb-staggerIn 0.5s ease-out 1.2s both',
                        letterSpacing: '0.04em',
                    }}
                >
                    ⚓ ReviewDock — Smart review management for modern businesses
                </p>
            </div>
        </div>
    )
}
