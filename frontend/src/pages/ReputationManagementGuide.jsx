import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ReputationManagementGuide() {
    useEffect(() => {
        document.title = "The Best Online Reputation Management Tool 2026 | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Learn how to filter negative reviews privately and improve your local SEO using the top reputation management platform for small businesses.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Learn how to filter negative reviews privately and improve your local SEO using the top reputation management platform for small businesses.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            <header className="absolute top-0 w-full z-50 px-4 py-6 border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
                        Review Dock
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        Protect Reputation Free
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-red-500/30 mb-6 text-sm text-red-300 font-medium tracking-wide">
                        Reputation Management Guide 🛡️
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        The Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Online Reputation Management Tool</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A single 1-star review can devastate your local SEO. Discover exactly <strong>how to filter negative reviews privately</strong> and protect your business before damage is done.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transition-all">
                            Set Up Your Protection Instantly
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-16 prose prose-invert prose-lg">
                <h2 className="text-3xl font-bold text-white mb-6">How to Handle Bad Google Reviews Professionally</h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    Most founders panic when they receive a 1-star notification. Their first impulse is to argue. But the absolute best strategy is to <strong>prevent negative reviews on google ethically</strong> before they are ever published online. This is exactly why every local company needs a reliable <strong>reputation management platform</strong>.
                </p>

                <h2 className="text-3xl font-bold text-white mb-6 mt-12">The Ultimate Reputation Management Checklist for Business</h2>
                
                <div className="space-y-8">
                    <div className="p-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-2xl border border-orange-500/20">
                        <h3 className="text-xl font-bold text-orange-300 mb-3">1. How to collect private feedback before public review?</h3>
                        <p className="text-gray-300">Setting up a "Smart Link" or a QR code landing page is critical. Never link directly to Google Maps. Ask the customer: "How was your experience (1-5 stars)?" This allows you to route them effectively.</p>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-2xl border border-red-500/20">
                        <h3 className="text-xl font-bold text-red-300 mb-3">2. Manage bad reviews without hurting brand</h3>
                        <p className="text-gray-300">If the customer selects 1, 2, or 3 stars on your Smart Link, use the <strong>reputation management tool free</strong> features in Review Dock to immediately capture their rant in a private form. The email goes only to the manager—keeping your public profile absolutely pristine.</p>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-2xl border border-pink-500/20">
                        <h3 className="text-xl font-bold text-pink-300 mb-3">3. How to improve online reputation fast</h3>
                        <p className="text-gray-300">If they select 4 or 5 stars, automatically and instantly redirect their browser straight into your Google Business review box. By filtering the hate and accelerating the love, your star average jumps dramatically in literally days.</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-6 mt-12">Review Dock: One of the Best Reputation Management Tools 2026</h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    Corporate brands spend thousands of dollars a month on bulky enterprise software. Review Dock is built as the ultimate <strong>reputation management for small businesses</strong>. Stop worrying about disgruntled employees or single bad interactions ruining years of hard work. 
                </p>
                <div className="text-center mt-12 mb-4">
                    <Link to="/signup" className="inline-block px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-xl">
                        Start Guarding Your Reputation Today
                    </Link>
                </div>
            </section>
        </main>
    );
}
