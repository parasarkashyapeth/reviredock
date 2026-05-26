import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reviewDockFaqs } from '../data/reviewDockFaqs';

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
            { threshold: 0, rootMargin: '0px 0px -40px 0px', ...options }
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


function ReviewDemo() {
    const [step, setStep] = useState(0);
    const [text, setText] = useState("");
    const [starsHovered, setStarsHovered] = useState(0);
    const fullText = "Absolutely stellar! The simple interface made my life 10x easier. Highly recommended.";

    useEffect(() => {
        let isMounted = true;
        const runDemo = async () => {
            while (isMounted) {
                setStep(0);
                setText("");
                setStarsHovered(0);
                await new Promise(r => setTimeout(r, 1500));
                if (!isMounted) return;
                
                // Move mouse towards stars
                setStep(0.5); // moving
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                
                // Simulate hovering over stars
                for(let i=1; i<=5; i++) {
                     setStarsHovered(i);
                     await new Promise(r => setTimeout(r, 150));
                     if (!isMounted) return;
                }

                // Click stars
                setStep(1);
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;

                // Move mouse to textarea
                setStep(1.5);
                await new Promise(r => setTimeout(r, 400));
                
                // Type text
                setStep(2);
                await new Promise(r => setTimeout(r, 300));
                for (let i = 1; i <= fullText.length; i++) {
                    if (!isMounted) return;
                    setText(fullText.slice(0, i));
                    await new Promise(r => setTimeout(r, 15 + Math.random() * 30));
                }
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;

                // Move mouse to submit and click
                setStep(3);
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                
                // Click!
                setStep(3.5);
                await new Promise(r => setTimeout(r, 300));
                if (!isMounted) return;

                // Show success
                setStep(4);
                await new Promise(r => setTimeout(r, 3000));
            }
        };
        runDemo();
        return () => { isMounted = false; };
    }, []);

    const mousePos = {
        0: { left: '85%', top: '110%' }, // Hidden bottom
        0.5: { left: '80%', top: '38%' },  // over stars
        1: { left: '80%', top: '38%' },  // 5th star clicked
        1.5: { left: '50%', top: '65%' }, // to textarea
        2: { left: '50%', top: '65%' },  // Textarea typing
        3: { left: '50%', top: '88%' },  // Hover Submit button
        3.5: { left: '50%', top: '88%' },  // Click Submit button
        4: { left: '85%', top: '110%' }, // Hide
    };

    return (
        <div className="relative w-full max-w-[400px] mx-auto group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 ${step === 4 ? '!opacity-80 !from-emerald-500 !to-emerald-400 !blur-xl' : ''}`}></div>
            
            <div className="glass-card w-full p-6 sm:p-8 relative overflow-hidden min-h-[420px] bg-[#0a0a0a] flex flex-col justify-center border border-white/10 rounded-[28px] z-10 shadow-2xl shadow-black/50">
                <div className={`absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-black flex flex-col items-center justify-center transition-all duration-700 ease-out z-20 backdrop-blur-md ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-transform duration-700 delay-100 ${step === 4 ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
                            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className={`absolute inset-0 rounded-full border-2 border-emerald-400 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] ${step === 4 ? 'block' : 'hidden'}`}></div>
                    </div>
                    <h4 className={`text-2xl font-extrabold text-white mb-2 transition-all duration-500 delay-200 ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Review Published!</h4>
                    <p className={`text-emerald-300 font-medium text-sm transition-all duration-500 delay-300 ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Redirecting to Google...</p>
                </div>

                <div className={`w-full transition-all duration-500 ${step === 4 ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-white/20">
                                <span className="text-white font-black text-xl">A</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg tracking-wide">Acme Corp</h4>
                                <p className="text-xs text-gray-400 font-medium">How was your experience?</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-50">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54L20.0303 3.115C17.9503 1.195 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.65L5.31028 9.8C6.26028 6.81 9.00528 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.14 21.25C22.505 19.07 23.49 15.955 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.20998 6.5549C0.43998 8.0599 0 9.7599 0 11.9999C0 14.2399 0.43998 15.9399 1.20998 17.4449L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24C15.2404 24 17.9654 22.935 20.0604 21.095L16.0054 17.945C14.8954 18.685 13.5454 19.145 12.0004 19.145C8.95539 19.145 6.18039 17.025 5.20539 13.985L1.15039 17.135C3.15539 21.195 7.26039 24 12.0004 24Z" fill="#34A853"/></svg>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-3 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                                key={star} 
                                className={`w-9 h-9 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                                ${step >= 1 ? 'text-yellow-400 scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]' 
                                : starsHovered >= star ? 'text-yellow-400/80 scale-105' : 'text-gray-600 hover:text-gray-500 cursor-pointer'} 
                                ${step === 1 && star === 5 ? 'scale-125' : ''}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>

                    <div className="relative mb-6">
                        <textarea 
                            readOnly
                            value={text}
                            placeholder="Tell us what you loved..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[15px] leading-relaxed text-white resize-none h-28 focus:outline-none transition-all duration-300 placeholder:text-gray-600"
                        />
                        {(step === 2 || step === 3) && text.length < fullText.length && (
                            <div className="absolute inline-block w-0.5 h-[1.125rem] bg-purple-400 animate-pulse ml-[2px] mt-1 align-middle rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                        )}
                        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
                             <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </div>
                    </div>

                    <button 
                        disabled
                        className={`w-full py-3.5 sm:py-4 rounded-xl font-bold tracking-wide transition-all duration-300 ${
                            step >= 3 || (step === 2 && text.length === fullText.length)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.7)]' 
                                : 'bg-white/5 border border-white/10 text-gray-500'
                        } ${step === 3.5 ? 'scale-[0.97]' : 'scale-100'}`}
                    >
                        Publish Review
                    </button>
                    
                    <div 
                        className="absolute z-50 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                        style={{
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            left: mousePos[step]?.left || '50%',
                            top: mousePos[step]?.top || '110%',
                            opacity: step === 4 ? 0 : 1,
                            transform: (step === 1 || step === 3.5) ? 'scale(0.85) translate(-5%, -5%)' : 'scale(1)',
                            marginLeft: '-8px',
                            marginTop: '-4px',
                        }}
                    >
                        {/* OS Native-style Arrow Cursor */}
                        <svg 
                            className="w-8 h-8 text-black"
                            viewBox="0 0 32 32" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                d="M8 4L8 26L12.5 20L17 27.5L20 25.5L15.5 18L21 18L8 4Z" 
                                fill="currentColor" 
                                stroke="white" 
                                strokeWidth="2.5" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);
    const faqs = reviewDockFaqs;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                @keyframes fade-in {
                    0%, 10% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
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
                            <Link to="/website-testing-report" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-cyan-200 font-semibold hover:bg-white/10 transition-all text-xs sm:text-sm border border-cyan-300/20 hover:border-cyan-300/40">
                                Website Audit
                            </Link>
                            <Link to="/blog/business-failure-case-studies" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-gray-300 font-semibold hover:bg-white/10 transition-all text-xs sm:text-sm border border-transparent hover:border-white/20">
                                Business Stories
                            </Link>
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
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl mx-auto leading-[1.1] relative z-10">
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

            {/* How It Works — Visual Workflow */}
            <section className="relative px-4 py-16 md:py-28 bg-white/[0.02] overflow-hidden">
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes flow-line {
                        0%   { stroke-dashoffset: 400; opacity: 0; }
                        40%  { opacity: 1; }
                        100% { stroke-dashoffset: 0;   opacity: 0.9; }
                    }
                    @keyframes arrow-travel {
                        0%   { offset-distance: 0%;   opacity: 0; }
                        10%  { opacity: 1; }
                        90%  { opacity: 1; }
                        100% { offset-distance: 100%; opacity: 0; }
                    }
                    @keyframes pulse-dot {
                        0%, 100% { transform: scale(1);   opacity: 1; }
                        50%       { transform: scale(1.8); opacity: 0.5; }
                    }
                    @keyframes badge-pop {
                        0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
                        70%  { transform: scale(1.1) rotate(2deg); }
                        100% { transform: scale(1) rotate(0deg);  opacity: 1; }
                    }
                    @keyframes card-glow-pulse {
                        0%, 100% { opacity: 0.5; }
                        50%       { opacity: 1; }
                    }
                    @keyframes num-shine {
                        0%   { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                    .flow-line { stroke-dasharray: 400; animation: flow-line 2s cubic-bezier(0.4,0,0.2,1) infinite; }
                    .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
                    .badge-pop { animation: badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
                    .step-card { position: relative; }
                    .step-card::before {
                        content: '';
                        position: absolute; inset: 0;
                        border-radius: inherit;
                        padding: 1px;
                        background: var(--card-border-grad);
                        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        -webkit-mask-composite: xor;
                        mask-composite: exclude;
                        opacity: 0.4;
                        transition: opacity 0.4s;
                    }
                    .step-card:hover::before { opacity: 1; }
                    .step-card:hover { transform: translateY(-8px); box-shadow: 0 30px 80px var(--card-glow); }
                    .step-card { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease; }
                    .step-icon-wrap { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
                    .step-card:hover .step-icon-wrap { transform: scale(1.15) rotate(-6deg); }
                    .preview-bar { transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
                `}} />

                {/* Background glow blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10 blur-[80px]" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <Reveal>
                        <div className="text-center mb-14 md:mb-20">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                                <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">The Workflow</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">From Setup to Social Proof</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto">
                                Four effortless steps — go from zero to a thriving review engine in under 10 minutes.
                            </p>
                        </div>
                    </Reveal>

                    {/* Desktop — horizontal pipeline */}
                    <div className="hidden lg:block">
                        {/* Connector SVG between cards */}
                        <div className="relative flex items-start justify-between gap-4">
                            {/* SVG connector layer — visible animated arrows */}
                            <svg className="absolute top-9 left-0 w-full h-10 pointer-events-none z-20" viewBox="0 0 1000 40" preserveAspectRatio="none">
                                {/* Line 1: blue→purple */}
                                <path d="M248,20 L278,20" className="flow-line" stroke="url(#lg1)" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{animationDelay:'0s'}}/>
                                <polygon points="278,14 290,20 278,26" fill="#8b5cf6" opacity="0.9" style={{filter:'drop-shadow(0 0 4px #8b5cf6)'}}/>
                                {/* Line 2: purple→pink */}
                                <path d="M498,20 L528,20" className="flow-line" stroke="url(#lg2)" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{animationDelay:'0.7s'}}/>
                                <polygon points="528,14 540,20 528,26" fill="#ec4899" opacity="0.9" style={{filter:'drop-shadow(0 0 4px #ec4899)'}}/>
                                {/* Line 3: pink→emerald */}
                                <path d="M748,20 L778,20" className="flow-line" stroke="url(#lg3)" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{animationDelay:'1.4s'}}/>
                                <polygon points="778,14 790,20 778,26" fill="#10b981" opacity="0.9" style={{filter:'drop-shadow(0 0 4px #10b981)'}}/>
                                <defs>
                                    <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient>
                                    <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#ec4899"/></linearGradient>
                                    <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#10b981"/></linearGradient>
                                </defs>
                            </svg>

                            {[
                                {
                                    num: '01', label: 'Setup', title: 'Create Your Page',
                                    desc: 'Brand your review page with your logo, colors, and custom message. Ready in minutes.',
                                    gradient: 'from-blue-500 to-blue-700', glow: 'rgba(59,130,246,0.35)',
                                    border: 'hover:border-blue-500/40',
                                    badge: { text: 'Live in 2 min', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                                    preview: (
                                        <div className="mt-5 rounded-xl bg-black/40 border border-white/10 p-3 text-left space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">A</div>
                                                <div className="h-2 w-20 bg-white/20 rounded-full"/>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full"/>
                                            <div className="h-1.5 w-3/4 bg-white/10 rounded-full"/>
                                            <div className="flex gap-1 pt-1">
                                                {[1,2,3,4,5].map(s=><svg key={s} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                                            </div>
                                        </div>
                                    ),
                                    icon: <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                },
                                {
                                    num: '02', label: 'Share', title: 'Send to Customers',
                                    desc: 'Share your unique link or QR code via email, SMS, receipts, or in-store displays.',
                                    gradient: 'from-purple-500 to-purple-700', glow: 'rgba(139,92,246,0.35)',
                                    border: 'hover:border-purple-500/40',
                                    badge: { text: 'QR + Link', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                                    preview: (
                                        <div className="mt-5 rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 grid grid-cols-3 gap-[2px] p-1.5">
                                                {[...Array(9)].map((_,i)=><div key={i} className={`rounded-[2px] ${[0,2,6,8].includes(i)?'bg-purple-400':[4].includes(i)?'bg-purple-300':'bg-white/20'}`}/>)}
                                            </div>
                                            <div className="h-1.5 w-20 bg-purple-400/40 rounded-full"/>
                                            <div className="text-[9px] text-gray-500">scan to review</div>
                                        </div>
                                    ),
                                    icon: <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                },
                                {
                                    num: '03', label: 'Collect', title: 'Reviews Roll In',
                                    desc: 'Customers rate, write feedback, and submit — all routed through our smart filter to protect your reputation.',
                                    gradient: 'from-pink-500 to-pink-700', glow: 'rgba(236,72,153,0.35)',
                                    border: 'hover:border-pink-500/40',
                                    badge: { text: 'Smart Filter', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
                                    preview: (
                                        <div className="mt-5 rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                                            {[{stars:5,w:'w-full'},{stars:5,w:'w-4/5'},{stars:4,w:'w-3/4'}].map((r,i)=>(
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="flex gap-0.5">{[...Array(5)].map((_,j)=><svg key={j} className={`w-2.5 h-2.5 ${j<r.stars?'text-yellow-400':'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div>
                                                    <div className={`h-1.5 ${r.w} bg-pink-400/30 rounded-full`}/>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                    icon: <svg className="w-7 h-7 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                                },
                                {
                                    num: '04', label: 'Grow', title: 'Showcase & Convert',
                                    desc: 'Display your reviews as widgets, push 5-star feedback to Google, and watch your reputation — and revenue — soar.',
                                    gradient: 'from-emerald-500 to-emerald-700', glow: 'rgba(16,185,129,0.35)',
                                    border: 'hover:border-emerald-500/40',
                                    badge: { text: '+270% Conversions', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                                    preview: (
                                        <div className="mt-5 rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-500">Google Rating</span>
                                                <span className="text-[10px] font-bold text-emerald-400">4.9 ★</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full" style={{width:'96%'}}/>
                                            </div>
                                            <div className="flex items-center gap-1 pt-1">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500/30 flex items-center justify-center"><svg className="w-2 h-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                                                <span className="text-[9px] text-emerald-400">Published to Google</span>
                                            </div>
                                        </div>
                                    ),
                                    icon: <svg className="w-7 h-7 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                                },
                            ].map((step, i) => (
                                <Reveal key={i} delay={i * 0.15} className="flex-1 min-w-0">
                                    <div
                                        className="step-card rounded-2xl p-5 h-full cursor-default bg-[#080808]"
                                        style={{'--card-border-grad': `linear-gradient(135deg, ${step.glow}, transparent 60%, ${step.glow})`, '--card-glow': step.glow}}
                                    >
                                        {/* Top row: number chip + label badge */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`step-icon-wrap w-11 h-11 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-black text-base text-white shrink-0`} style={{boxShadow:`0 6px 24px ${step.glow}`}}>
                                                {step.num}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${step.badge.color}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {/* Icon */}
                                        <div className="mb-3 opacity-90">{step.icon}</div>
                                        {/* Title */}
                                        <h3 className="text-[15px] font-bold text-white mb-1.5 tracking-tight">{step.title}</h3>
                                        {/* Desc */}
                                        <p className="text-gray-500 text-[11px] leading-relaxed mb-0">{step.desc}</p>
                                        {/* Mini preview */}
                                        {step.preview}
                                        {/* Status badge */}
                                        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold ${step.badge.color}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot"/>
                                            {step.badge.text}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* Mobile — vertical timeline */}
                    <div className="lg:hidden space-y-0">
                        {[
                            { num:'01', label:'Setup',   title:'Create Your Page',       desc:'Brand your review page in minutes — no coding needed.',          gradient:'from-blue-500 to-blue-700',    dot:'bg-blue-500',    badge:'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                            { num:'02', label:'Share',   title:'Send to Customers',      desc:'Share your link or QR code via email, SMS, or in-store.',        gradient:'from-purple-500 to-purple-700', dot:'bg-purple-500',  badge:'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                            { num:'03', label:'Collect', title:'Reviews Roll In',        desc:'Customers rate & submit — smart filters protect your brand.',     gradient:'from-pink-500 to-pink-700',    dot:'bg-pink-500',    badge:'bg-pink-500/20 text-pink-300 border-pink-500/30' },
                            { num:'04', label:'Grow',    title:'Showcase & Convert',     desc:'Push 5-star reviews to Google. Watch conversions soar.',          gradient:'from-emerald-500 to-emerald-700', dot:'bg-emerald-500', badge:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                        ].map((step, i, arr) => (
                            <div key={i} className="flex gap-4">
                                {/* Timeline spine */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-black text-sm text-white shadow-lg shrink-0`}>
                                        {step.num}
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className="w-px flex-1 my-2 bg-gradient-to-b from-white/20 to-transparent min-h-[48px]"/>
                                    )}
                                </div>
                                {/* Card */}
                                <Reveal delay={i * 0.1} direction="left" className="flex-1 pb-6">
                                    <div className="rounded-2xl bg-[#080808] border border-white/[0.08] p-4 hover:-translate-y-1 transition-transform duration-300" style={{boxShadow:`0 0 0 1px ${step.dot === 'bg-blue-500' ? 'rgba(59,130,246,0.15)' : step.dot === 'bg-purple-500' ? 'rgba(139,92,246,0.15)' : step.dot === 'bg-pink-500' ? 'rgba(236,72,153,0.15)' : 'rgba(16,185,129,0.15)'}`}}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-bold text-white">{step.title}</h3>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${step.badge}`}>{step.label}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                                    </div>
                                </Reveal>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Demo Section */}
            <section className="relative px-4 py-16 md:py-24 border-t border-white/5 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-purple-600/5 blur-[120px] rounded-full" />
                </div>
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <Reveal className="lg:w-1/2" direction="right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-max mb-6">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                            <span className="text-xs font-semibold tracking-wide text-gray-300">See It In Action</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">
                            Frictionless Feedback
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
                            Watch how easily your customers can leave glowing reviews.
                            We've minimized the steps so you get maximum feedback. No logins, no hassle—just a smooth, delightful experience.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "1-Click Star Ratings",
                                "Smooth Custom Interfaces",
                                "Zero Friction Point"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                    
                    <Reveal className="lg:w-1/2 w-full" delay={0.2} direction="left">
                        <ReviewDemo />
                    </Reveal>
                </div>
            </section>

            {/* User Reviews Section */}
            <section className="relative px-4 py-16 md:py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4">
                                Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Modern Businesses</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto px-2">
                                See how Review Dock's smart features are helping real companies grow their online reputation and revenue.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Review 1 */}
                        <Reveal delay={0.12} direction="up">
                            <div className="glass-card p-6 md:p-8 flex flex-col h-full hover:border-[#8b5cf6]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-1 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                                    "The <strong className="text-white font-medium">Smart Google Redirect</strong> is a game changer. We filter out negative experiences privately and direct only our happiest customers to Google. Our 5-star rating shot up in just two weeks!"
                                </p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg shadow-blue-500/20">
                                        JS
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm md:text-base">Jessica S.</p>
                                        <p className="text-gray-500 text-xs md:text-sm">Boutique Cafe Owner</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Review 2 */}
                        <Reveal delay={0.24} direction="up">
                            <div className="glass-card p-6 md:p-8 flex flex-col h-full hover:border-[#ec4899]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-1 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                                    "We placed the <strong className="text-white font-medium">Custom QR Codes</strong> on all our tables and checkout counters. It's friction-free. Customers scan, hit 5 stars, and leave incredible feedback before they even walk out the door."
                                </p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg shadow-pink-500/20">
                                        MR
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm md:text-base">Marcus R.</p>
                                        <p className="text-gray-500 text-xs md:text-sm">Restaurant Manager</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Review 3 */}
                        <Reveal delay={0.36} direction="up">
                            <div className="glass-card p-6 md:p-8 flex flex-col h-full hover:border-[#10b981]/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-1 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                                    "The <strong className="text-white font-medium">Feedback Dashboard</strong> acts like our central hub. Having all customer sentiment centralized lets me quickly address issues privately before they ever escalate publicly."
                                </p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg shadow-emerald-500/20">
                                        DL
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm md:text-base">David L.</p>
                                        <p className="text-gray-500 text-xs md:text-sm">SaaS Founder</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Website Testing Report Section */}
            <section className="relative px-4 py-16 sm:py-20 md:py-24 border-t border-white/10 bg-[#05070d]">
                <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <Reveal direction="right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 w-max mb-4 sm:mb-6">
                            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]"></span>
                            <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-cyan-100">NEW SERVICE</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight text-white">
                            Website testing reports for growing brands.
                        </h2>
                        <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                            Submit any live website URL and get a basic instant report with SEO, UX, performance, feature, and improvement insights. Upgrade to a complete human-reviewed report delivered within 24 to 48 hours for {"\u20B9"}599 per website.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link to="/website-testing-report" className="px-6 py-3 rounded-xl bg-cyan-300 text-black font-bold text-center hover:bg-cyan-200 transition-colors">
                                Test a Website
                            </Link>
                            <Link to="/business-idea-generator" className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-center hover:bg-white/10 transition-colors">
                                Try Idea Generator
                            </Link>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15} direction="left">
                        <div className="rounded-3xl border border-white/10 bg-[#0f1420] p-5 sm:p-6 shadow-2xl shadow-cyan-950/20">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    ["SEO", "Titles, schema, internal links, content depth"],
                                    ["UX", "CTA clarity, mobile layout, trust signals"],
                                    ["Performance", "Media weight, scripts, loading priority"],
                                    ["Competitors", "Positioning, offers, proof, feature gaps"]
                                ].map(([title, body]) => (
                                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <p className="text-lg font-bold text-white">{title}</p>
                                        <p className="mt-2 text-sm leading-6 text-gray-300">{body}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                                <p className="text-sm font-bold text-cyan-100">Popup CTA</p>
                                <p className="mt-2 text-sm leading-6 text-gray-300">"Submit your live website URL - we will test it and provide a complete website testing report within 24 to 48 hours."</p>
                            </div>
                        </div>
                    </Reveal>
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
            <section className="relative px-4 py-16 sm:py-20 md:py-24 border-t border-white/10 bg-[#070a12]">
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
                    <Reveal className="lg:w-1/2 flex flex-col rounded-2xl border border-white/10 bg-[#0f1420] p-3 sm:p-5 shadow-2xl shadow-black/30" delay={0.2} direction="left">
                        {faqs.slice(0, 5).map((faq, index) => {
                            const isOpen = openFaq === index;
                            const showCategory = index === 0 || faq.category !== faqs[index - 1].category;
                            return (
                                <React.Fragment key={`${faq.category}-${faq.question}`}>
                                    {showCategory && (
                                        <h3 className="px-2 pt-7 pb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#a78bfa] first:pt-2">
                                            {faq.category}
                                        </h3>
                                    )}
                                    <div className={`mb-2 rounded-xl border transition-colors duration-300 ${isOpen ? 'border-[#8b5cf6]/45 bg-white/[0.07]' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}>
                                        <button 
                                            className="w-full px-4 py-4 sm:px-5 sm:py-5 flex items-center justify-between text-left focus:outline-none group"
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        >
                                            <span className={`text-sm sm:text-base md:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-100 group-hover:text-white'}`}>
                                                {faq.question}
                                            </span>
                                            <div className="ml-3 sm:ml-4 shrink-0 transition-transform duration-300 flex items-center justify-center">
                                                <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isOpen ? 'text-[#8b5cf6] rotate-180' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>
                                        <div 
                                            className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[520px] opacity-100 pb-4 sm:pb-5' : 'max-h-0 opacity-0 pb-0'}`}
                                        >
                                            <p className="px-4 sm:px-5 text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div className="mt-8 flex justify-center lg:justify-start">
                            <Link to="/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-purple-500/30 text-white font-semibold hover:bg-white/10 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] group">
                                View All FAQs
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Free Tools Section ── */}
            <Reveal>
                <section className="relative px-4 py-16 md:py-24 border-t border-white/5 overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-600/6 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/6 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 8px rgba(6,182,212,0.9)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                                <span className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">Free Tools</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                    Grow your business smarter
                                </span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                                Free tools to test, improve, and build — no signup required.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Tool 1 — Website Testing */}
                            <Link to="/website-testing-report" style={{ textDecoration: 'none' }}>
                                <div className="group glass-card p-6 hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" style={{ borderColor: 'rgba(6,182,212,0.15)' }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                                        🔍
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.25)' }}>
                                        Free instant scan · ₹599 full audit
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Website Testing Report</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                                        Enter any URL and get an instant score across SEO, UX, performance, features and competitors. Full expert audit delivered in 24–48 hours.
                                    </p>
                                    <span className="text-cyan-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Test your website →
                                    </span>
                                </div>
                            </Link>

                            {/* Tool 2 — Business Idea Generator */}
                            <Link to="/business-idea-generator" style={{ textDecoration: 'none' }}>
                                <div className="group glass-card p-6 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" style={{ borderColor: 'rgba(167,139,250,0.15)' }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}>
                                        💡
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(167,139,250,0.1)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.25)' }}>
                                        Searchiva · Business Advisor
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Business Idea Generator</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                                        Tell us your situation and skills. We'll suggest realistic side hustles, business ideas, and income sources with roadmaps and income estimates.
                                    </p>
                                    <span className="text-purple-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Generate my ideas →
                                    </span>
                                </div>
                            </Link>

                            {/* Tool 3 — Business Failure Stories */}
                            <Link to="/blog/business-failure-case-studies" style={{ textDecoration: 'none' }}>
                                <div className="group glass-card p-6 hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" style={{ borderColor: 'rgba(251,113,133,0.15)' }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.25)' }}>
                                        📉
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(251,113,133,0.1)', color: '#fda4af', border: '1px solid rgba(251,113,133,0.25)' }}>
                                        100xSolutions Blog · 12 case studies
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Business Failure Stories</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                                        Deep-dive case studies of companies like Theranos, WeWork, Quibi, and Vine — what went wrong, why they failed, and what founders can learn.
                                    </p>
                                    <span className="text-pink-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read case studies →
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>
            </Reveal>

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
