import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Scroll-triggered animation hook
function useScrollReveal(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, isVisible];
}

// Animated section wrapper
function Reveal({ children, delay = 0, className = '', direction = 'up' }) {
    const [ref, isVisible] = useScrollReveal();
    const transforms = {
        up: 'translateY(48px)',
        down: 'translateY(-48px)',
        left: 'translateX(48px)',
        right: 'translateX(-48px)',
        none: 'none',
    };
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'none' : transforms[direction],
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

export default function LandingPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            question: "What exactly does Review Dock do?",
            answer: "Review Dock centralizes your customer feedback, allowing you to easily request, manage, and showcase verified reviews across your website and marketing channels to build immediate trust."
        },
        {
            question: "Is this just another review widget?",
            answer: "No, Review Dock is a complete feedback operating system. We provide smart Google Review redirects, AI sentiment analysis, and customized QR codes to ensure you capture positive feedback where it matters most."
        },
        {
            question: "What happens after I sign up?",
            answer: "You can instantly create a custom review collection page and start sharing your link or QR code with customers. New reviews will automatically appear in your central dashboard."
        },
        {
            question: "Can Review Dock actually drive revenue?",
            answer: "Absolutely. Products with authentic, verified reviews see up to a 270% increase in conversion rates. By showcasing social proof, you reduce buyer hesitation and drive more sales."
        },
        {
            question: "Is there a free plan available?",
            answer: "Yes! We offer a completely free plan that includes up to 50 feedbacks per month and custom QR code generation so you can start building trust risk-free."
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) return null;

    return (
        <main className="min-h-screen bg-black overflow-x-hidden text-white font-sans relative">
            <style dangerouslySetInnerHTML={{__html: `
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.8);
                }
                @media (min-width: 640px) {
                    .chip { font-size: 0.875rem; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
                    50% { box-shadow: 0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(59,130,246,0.2); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .float-slow { animation: float 8s ease-in-out infinite; }
                .float-fast { animation: float 6s ease-in-out infinite 1s; }
                .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
                .hero-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: shimmer 5s ease-in-out infinite;
                }
            `}} />

            {/* Top Navigation */}
            <Reveal delay={0} direction="down">
                <header className="absolute top-0 w-full z-50 px-4 py-4 md:py-6">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <a href="https://100xsolutions.live" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-bold text-sm tracking-wide hover:text-white transition-colors duration-300">
                            100xSolutions
                        </a>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                            {user ? (
                                <Link to="/dashboard" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-xs sm:text-sm">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-white font-semibold hover:bg-white/10 transition-all text-xs sm:text-sm border border-transparent hover:border-white/20">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>
            </Reveal>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] float-slow" />
                    <div className="absolute bottom-1/4 -right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] float-fast" />
                </div>

                <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
                    {/* Logo/Icon */}
                    <Reveal delay={0.1}>
                        <div className="flex items-center justify-center mt-16 sm:mt-12 md:mt-0 mb-4 md:mb-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center pulse-glow">
                                <span className="text-2xl sm:text-3xl">⭐</span>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl mx-auto leading-[1.1]">
                            <span className="text-white">Review Dock</span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.35}>
                        <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2 mt-4 md:mt-6">
                            The ultimate platform designed to track, manage, and showcase user reviews to build trust and improve conversions for your brand.
                        </p>
                    </Reveal>

                    {/* CTA Buttons */}
                    <Reveal delay={0.5}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 md:pt-8 w-full px-2 sm:px-4 md:px-8">
                            {user ? (
                                <Link to="/dashboard" className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all text-sm sm:text-base md:text-lg flex justify-center items-center gap-2 group">
                                    Go to Dashboard
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/signup" className="w-full sm:w-auto px-6 py-3 md:px-10 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all text-sm sm:text-base md:text-lg flex justify-center items-center gap-2 group">
                                        Start Collecting Free
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <Link to="/login" className="w-full sm:w-auto px-6 py-3 md:px-10 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all text-sm sm:text-base md:text-lg flex justify-center">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </Reveal>

                    {/* Trust indicators */}
                    <Reveal delay={0.65}>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-6 md:pt-8 w-full">
                            <span className="chip">
                                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
                                Verified Feedback
                            </span>
                            <span className="chip">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]"></span>
                                Centralized Dashboard
                            </span>
                            <span className="chip">
                                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,1)]"></span>
                                Instant Social Proof
                            </span>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative px-4 py-16 md:py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <div className="text-center mb-12 md:mb-20">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 md:mb-6">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Why Review Dock Matters</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-3xl mx-auto px-2">
                                Authentic reviews are the currency of trust. Let your customers speak for you, and watch your conversion rates soar.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {[
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
                                title: "Centralize Feedback",
                                desc: "Gather customer feedback and testimonials in one centralized, beautifully organized place.",
                                color: "blue",
                                hoverBorder: "hover:border-blue-500/30"
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
                                title: "Increase Conversions",
                                desc: "Provide strong social proof that reassures potential buyers and dramatically impacts your bottom line.",
                                color: "purple",
                                hoverBorder: "hover:border-purple-500/30"
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />,
                                title: "Build Brand Trust",
                                desc: "Turn satisfied users into vocal advocates to cultivate confidence inside your network.",
                                color: "pink",
                                hoverBorder: "hover:border-pink-500/30"
                            }
                        ].map((feature, i) => (
                            <Reveal key={i} delay={i * 0.12}>
                                <div className={`glass-card p-5 sm:p-6 md:p-8 text-center group ${feature.hoverBorder} transition-all duration-300 hover:-translate-y-1`}>
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-2xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <svg className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${feature.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative px-4 py-16 md:py-24 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <Reveal>
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">How It Works</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-xl">
                                Three simple steps to unlock the power of your community.
                            </p>
                        </div>
                    </Reveal>

                    <div className="space-y-4 md:space-y-6">
                        {[
                            { num: 1, title: "Create Your Space", desc: "Set up your customized review landing page in minutes. No coding required, just pure simplicity.", gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
                            { num: 2, title: "Share & Collect", desc: "Send your unique link to customers via email, SMS, or post-purchase flows and watch the reviews roll in.", gradient: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20" },
                            { num: 3, title: "Showcase Value", desc: "Display beautiful review widgets, QR codes, and analytics directly on your site or presentations.", gradient: "from-pink-500 to-pink-600", shadow: "shadow-pink-500/20" },
                        ].map((step, i) => (
                            <Reveal key={i} delay={i * 0.12} direction={i % 2 === 0 ? 'left' : 'right'}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 glass-card p-5 sm:p-6 md:p-8 hover:-translate-y-1 transition-transform duration-300">
                                    <div className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-lg ${step.shadow}`}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 md:mb-3">{step.title}</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm md:text-lg leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative px-4 py-16 sm:py-20 md:py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                                <span className="text-white">Simple, Transparent Pricing</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                                Choose the plan that fits your needs. Start free and upgrade as you grow.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <Reveal delay={0}>
                            <div className="bg-[#0a0a0a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/5 relative flex flex-col justify-between min-h-[400px] sm:min-h-[440px] md:min-h-[500px] hover:-translate-y-1 transition-transform duration-300">
                                <div>
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Free</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">Perfect for getting started</p>
                                    </div>
                                    <div className="mb-4 sm:mb-6 flex items-baseline">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">₹0</span>
                                        <span className="text-gray-500 ml-1 text-sm">/mo</span>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { text: "50 Feedbacks / mo", on: true, bold: true },
                                            { text: "QR Code Generation", on: true },
                                            { text: "Smart Google Redirect", on: false },
                                            { text: "AI Sentiment Analysis", on: false },
                                        ].map((f, i) => (
                                            <div key={i} className={`flex items-center gap-2 sm:gap-3 ${!f.on ? 'opacity-50' : ''}`}>
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${f.on ? 'bg-emerald-500/20' : 'bg-gray-500/20'} flex items-center justify-center shrink-0`}>
                                                    <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${f.on ? 'text-emerald-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        {f.on ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                                                    </svg>
                                                </div>
                                                <span className={`${f.on ? 'text-white' : 'text-gray-400'} ${f.bold ? 'font-semibold' : ''} text-xs sm:text-sm`}>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/signup" className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 px-6 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all text-center text-sm sm:text-base">
                                    Get Started Free
                                </Link>
                            </div>
                        </Reveal>

                        {/* Pro Plan */}
                        <Reveal delay={0.12}>
                            <div className="bg-[#0a0a0a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/5 relative flex flex-col justify-between min-h-[400px] sm:min-h-[440px] md:min-h-[500px] hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#8b5cf6] rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg">
                                    Most Popular
                                </div>
                                <div>
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Pro</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">For growing businesses</p>
                                    </div>
                                    <div className="mb-4 sm:mb-6 flex items-baseline">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">₹299</span>
                                        <span className="text-gray-500 ml-1 text-sm">/mo</span>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { text: "Unlimited Feedbacks", on: true, bold: true },
                                            { text: "QR Code Generation", on: true },
                                            { text: "Smart Google Redirect", on: true },
                                            { text: "AI Sentiment Analysis", on: false },
                                        ].map((f, i) => (
                                            <div key={i} className={`flex items-center gap-2 sm:gap-3 ${!f.on ? 'opacity-50' : ''}`}>
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${f.on ? 'bg-emerald-500/20' : 'bg-gray-500/20'} flex items-center justify-center shrink-0`}>
                                                    <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${f.on ? 'text-emerald-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        {f.on ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                                                    </svg>
                                                </div>
                                                <span className={`${f.on ? 'text-white' : 'text-gray-400'} ${f.bold ? 'font-semibold' : ''} text-xs sm:text-sm`}>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/signup" className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white font-semibold hover:opacity-90 transition-all text-center text-sm sm:text-base">
                                    Upgrade to Pro
                                </Link>
                            </div>
                        </Reveal>

                        {/* Elite Plan */}
                        <Reveal delay={0.24}>
                            <div className="bg-[#0a0a0a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/5 relative flex flex-col justify-between min-h-[400px] sm:min-h-[440px] md:min-h-[500px] sm:col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#f97316] rounded-full text-[10px] sm:text-xs font-bold text-black shadow-lg">
                                    Enterprise
                                </div>
                                <div>
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Elite</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">For serious brands</p>
                                    </div>
                                    <div className="mb-4 sm:mb-6 flex items-baseline">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">₹2,999</span>
                                        <span className="text-gray-500 ml-1 text-sm">/mo</span>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { text: "Everything in Pro", on: true, bold: true, amber: false },
                                            { text: "AI Sentiment Analysis", on: true, amber: true },
                                            { text: "Priority Support", on: true, amber: true },
                                            { text: "Growth Strategy Call", on: true, amber: true },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 sm:gap-3">
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${f.amber ? 'bg-amber-500/20' : 'bg-emerald-500/20'} flex items-center justify-center shrink-0`}>
                                                    <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${f.amber ? 'text-[#f59e0b]' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className={`${f.amber ? 'text-[#f59e0b]' : 'text-white'} ${f.bold ? 'font-semibold' : ''} text-xs sm:text-sm`}>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/signup" className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 px-6 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-all text-center text-sm sm:text-base">
                                    Upgrade to Elite
                                </Link>
                            </div>
                        </Reveal>
                    </div>

                    {/* Feature Comparison Table */}
                    <Reveal delay={0.15}>
                        <div className="bg-[#0a0a0a] rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden mt-10 sm:mt-12 md:mt-16 max-w-5xl mx-auto">
                            <div className="p-4 sm:p-6 border-b border-white/5">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Feature Comparison</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm md:text-base min-w-[480px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left p-3 sm:p-4 md:p-6 font-medium text-gray-400">Feature</th>
                                            <th className="text-center p-3 sm:p-4 md:p-6 font-medium text-gray-400">Free</th>
                                            <th className="text-center p-3 sm:p-4 md:p-6 font-medium text-[#8b5cf6]">Pro</th>
                                            <th className="text-center p-3 sm:p-4 md:p-6 font-medium text-[#f59e0b]">Elite</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { feature: "Feedbacks / mo", free: "50", pro: "Unlimited", elite: "Unlimited", proBold: true, eliteBold: true },
                                            { feature: "QR Code Generation", free: "✓", pro: "✓", elite: "✓", allGreen: true },
                                            { feature: "Dashboard Analytics", free: "Basic", pro: "Advanced", elite: "Advanced", proGreen: true, eliteGreen: true },
                                            { feature: "Smart Google Redirect", free: "—", pro: "✓", elite: "✓", proGreen: true, eliteGreen: true, freeDash: true },
                                            { feature: "Export Feedback Data", free: "—", pro: "✓", elite: "✓", proGreen: true, eliteGreen: true, freeDash: true },
                                            { feature: "Customer Sentiment AI", free: "—", pro: "—", elite: "✓", eliteAmber: true, freeDash: true, proDash: true },
                                            { feature: "Email Notifications", free: "—", pro: "—", elite: "✓", eliteAmber: true, freeDash: true, proDash: true },
                                            { feature: "Priority Support", free: "—", pro: "—", elite: "✓", eliteAmber: true, freeDash: true, proDash: true },
                                            { feature: "Strategy & Growth Call", free: "—", pro: "—", elite: "✓", eliteAmber: true, freeDash: true, proDash: true },
                                        ].map((row, i) => (
                                            <tr key={i} className={`${i < 8 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                                                <td className="p-3 sm:p-4 md:p-6 text-gray-300">{row.feature}</td>
                                                <td className={`p-3 sm:p-4 md:p-6 text-center ${row.allGreen || (!row.freeDash) ? 'text-emerald-400' : 'text-gray-500'} ${row.proBold && !row.freeDash ? 'font-semibold' : ''}`}>{row.free}</td>
                                                <td className={`p-3 sm:p-4 md:p-6 text-center ${row.allGreen || row.proGreen ? 'text-emerald-400' : row.proDash ? 'text-gray-500' : 'text-[#8b5cf6]'} ${row.proBold ? 'font-semibold' : ''}`}>{row.pro}</td>
                                                <td className={`p-3 sm:p-4 md:p-6 text-center ${row.eliteAmber ? 'text-[#f59e0b]' : row.allGreen || row.eliteGreen ? 'text-emerald-400' : 'text-[#f59e0b]'} ${row.eliteBold ? 'font-semibold' : ''}`}>{row.elite}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative px-4 py-16 sm:py-20 md:py-24 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 sm:gap-12 lg:gap-24">
                    {/* Left content */}
                    <Reveal className="lg:w-1/2 flex flex-col justify-start" direction="right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-max mb-4 sm:mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-gray-300">FAQ</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight text-white">
                            Build Trust, <br/>
                            We Are Better!
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-12 leading-relaxed max-w-lg">
                            We are building the standard for customer trust. Here's everything you need to know about how Review Dock helps you win in the new era of feedback.
                        </p>
                        
                        {/* Wavy decoration block */}
                        <div className="relative w-full h-36 sm:h-48 md:h-64 rounded-2xl sm:rounded-3xl bg-[#0a0a0a] border border-white/5 overflow-hidden flex items-center justify-center hero-shimmer">
                            <div className="absolute inset-0 opacity-40">
                                <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                                    <path d="M-10,120 C80,60 250,160 410,120 L410,210 L-10,210 Z" fill="url(#grad1)" opacity="0.3" />
                                    <path d="M-10,100 C150,180 250,50 410,100 L410,210 L-10,210 Z" fill="url(#grad2)" opacity="0.3" />
                                    <path d="M-10,140 C120,40 300,180 410,140 L410,210 L-10,210 Z" fill="none" stroke="url(#grad2)" strokeWidth="1" opacity="0.5" />
                                    <path d="M-10,110 C180,200 220,60 410,110 L410,210 L-10,210 Z" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.5" />
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </Reveal>

                    {/* Right accordion */}
                    <Reveal className="lg:w-1/2 flex flex-col" delay={0.2} direction="left">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div key={index} className="border-b border-white/10 last:border-0">
                                    <button 
                                        className="w-full py-4 sm:py-5 md:py-6 flex items-center justify-between text-left focus:outline-none group"
                                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                    >
                                        <span className={`text-sm sm:text-base md:text-lg lg:text-xl font-medium transition-colors duration-300 ${isOpen ? 'text-[#8b5cf6]' : 'text-white group-hover:text-gray-300'}`}>
                                            {faq.question}
                                        </span>
                                        <div className="ml-3 sm:ml-4 shrink-0 transition-transform duration-300 flex items-center justify-center">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isOpen ? 'text-[#8b5cf6] rotate-180' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    <div 
                                        className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4 sm:mb-6' : 'max-h-0 opacity-0 mb-0'}`}
                                    >
                                        <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed pr-6 sm:pr-8">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </Reveal>
                </div>
            </section>

            {/* Final CTA Section */}
            <Reveal>
                <section className="relative px-4 py-20 sm:py-24 md:py-32 text-center border-t border-white/5 bg-black">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
                            Ready to get <span className="text-gray-400">Verified?</span>
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
                            Join thousands of brands building trust for the future of sales.
                        </p>
                        <div className="flex flex-col items-center justify-center">
                            {user ? (
                                <Link to="/dashboard" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-black font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transform duration-300">
                                    Enter Dashboard
                                </Link>
                            ) : (
                                <Link to="/signup" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-black font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transform duration-300">
                                    Start Collecting Free
                                </Link>
                            )}
                            <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs md:text-sm text-[#4b5563]">
                                No credit card required • Free forever plan available
                            </p>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Footer */}
            <footer className="px-4 py-8 sm:py-10 md:py-12 text-center bg-black">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 sm:gap-6">
                    <p className="text-[10px] sm:text-xs md:text-sm text-[#4b5563] font-medium">
                         © 2026 Review Dock • Built by 100xSolutions • The standard for trust
                    </p>
                    <div className="flex gap-4 sm:gap-6 md:gap-8 text-[10px] sm:text-xs md:text-sm text-[#4b5563] font-medium">
                        <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
