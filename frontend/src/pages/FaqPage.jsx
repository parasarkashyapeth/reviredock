import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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

export default function FaqPage() {
    const [openFaq, setOpenFaq] = useState(0);
    const faqs = reviewDockFaqs;

    useEffect(() => {
        document.title = "Frequently Asked Questions | Review Dock";
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-[#070a12] overflow-x-hidden text-white font-sans relative">
            {/* Top Navigation */}
            <header className="absolute top-0 w-full z-50 px-4 py-4 md:py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Review Dock
                    </Link>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                        <Link to="/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Header Section */}
            <section className="relative pt-32 pb-16 px-4 border-b border-white/5">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-max mb-6 mx-auto">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            <span className="text-xs font-semibold tracking-wide text-gray-300">Support Center</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Questions</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            Everything you need to know about Review Dock and how we can help you build trust and increase conversions.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* FAQ List Section */}
            <section className="relative px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <Reveal delay={0.2} direction="up" className="flex flex-col gap-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            const showCategory = index === 0 || faq.category !== (faqs[index - 1]?.category);
                            return (
                                <React.Fragment key={`${faq.category}-${faq.question}`}>
                                    {showCategory && (
                                        <h3 className="px-2 pt-8 pb-3 text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-[#a78bfa] first:pt-2">
                                            {faq.category}
                                        </h3>
                                    )}
                                    <div className={`rounded-xl border transition-colors duration-300 ${isOpen ? 'border-[#8b5cf6]/45 bg-white/[0.07]' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}>
                                        <button 
                                            className="w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none group"
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        >
                                            <span className={`text-base md:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-100 group-hover:text-white'}`}>
                                                {faq.question}
                                            </span>
                                            <div className="ml-4 shrink-0 transition-transform duration-300 flex items-center justify-center">
                                                <svg className={`w-5 h-5 transition-all duration-300 ${isOpen ? 'text-[#8b5cf6] rotate-180' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>
                                        <div 
                                            className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[520px] opacity-100 pb-5' : 'max-h-0 opacity-0 pb-0'}`}
                                        >
                                            <p className="px-5 text-gray-300 text-sm md:text-base leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </Reveal>
                </div>
            </section>

            {/* Final CTA Section */}
            <Reveal>
                <section className="relative px-4 py-20 text-center border-t border-white/5 bg-black">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
                            Still have questions?
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Reach out to our support team.
                        </p>
                        <div className="flex flex-col items-center justify-center">
                            <Link to="/signup" className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transform duration-300">
                                Start Collecting Free
                            </Link>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Footer */}
            <footer className="px-4 py-8 text-center bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4">
                    <p className="text-[10px] sm:text-xs text-[#4b5563] font-medium">
                         © 2026 Review Dock • Built by 100xSolutions • The standard for trust
                    </p>
                    <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-xs text-[#4b5563] font-medium">
                        <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
