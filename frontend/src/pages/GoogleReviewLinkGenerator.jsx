import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function GoogleReviewLinkGenerator() {
    useEffect(() => {
        document.title = "Free Google Review Generator Link for Business | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Our free Google review link generator creates a direct review URL for your business. Easily send review request via WhatsApp, SMS, or Email to skyrocket your ratings.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Our free Google review link generator creates a direct review URL for your business. Easily send review request via WhatsApp, SMS, or Email to skyrocket your ratings.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            <header className="absolute top-0 w-full z-50 px-4 py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Review Dock
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        Generate Link Free
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-purple-500/30 mb-6 text-sm text-purple-300 font-medium tracking-wide">
                        Google Review Link Generator Free 🔗
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        Generate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Google Review Link for Business</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Stop asking customers to search for you manually. Use the best <strong>free google review collection tool</strong> to instantly make a short, clickable URL. Send review requests via WhatsApp, SMS, or email directly.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all">
                            Create Your Direct Generator Link Fast &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1 glass-card p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Why Use a Direct Generator Link?</h2>
                        <ul className="space-y-6 text-gray-300">
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Tools to Collect Reviews via WhatsApp</strong>
                                    Over 65% of SMS and WhatsApp messages are opened in the first 5 minutes. Dropping your <strong>google review generator link</strong> into a direct message ensures the absolute highest conversion rate. Let customers review you easily from their phone.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Remove the Friction Instantly</strong>
                                    Don't rely on consumers opening the Google app and typing your name. Your custom link takes them exactly to the 5-star dialogue box.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Perfect for Email Automation</strong>
                                    If you run an <strong>email review automation software</strong> or campaign, embedding this exact link in the "How did we do?" button multiplies your success dramatically compared to generic CTAs.
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="order-1 md:order-2 flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 w-full max-w-sm glass-card border-none bg-black/40 p-6 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-lg font-bold">Review Request Message Template for Customers</div>
                                <div className="text-purple-400 text-sm">Now</div>
                            </div>
                            <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-br-none mb-4 text-[15px] shadow-lg leading-relaxed">
                                Hi [Name]! Thank you for choosing us today. As a small business, reviews mean the world to us. <br /><br />
                                Could you please take 10 seconds to tap this link and leave a Google rating? <br /><br />
                                ✨ <span className="underline decoration-white/50 text-blue-100 font-semibold">reviewdock.co/b/your-business</span>
                            </div>
                            <div className="text-gray-400 text-xs text-center mt-2">Steal this template!</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white/5 border-t border-white/10 mt-12 py-16 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold mb-6">Need the best google review software for small business?</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Review Dock is your all-in-one reputation dashboard to create multiple review links safely. Build your reputation and collect 5-star ratings without breaking the bank on expensive alternatives.
                    </p>
                    <Link to="/signup" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                        Launch Your Review Link Free Today
                    </Link>
                </div>
            </section>
        </main>
    );
}
