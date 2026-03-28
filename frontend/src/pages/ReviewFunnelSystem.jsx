import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ReviewFunnelSystem() {
    useEffect(() => {
        document.title = "Review Funnel System & Software | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Build a high-converting review funnel system. A powerful review funnel software designed to filter negative reviews privately and generate 5-star ratings.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Build a high-converting review funnel system. A powerful review funnel software designed to filter negative reviews privately and generate 5-star ratings.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            <header className="absolute top-0 w-full z-50 px-4 py-6 border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Review Dock
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                        Start Funnel Free
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-indigo-500/30 mb-6 text-sm text-indigo-300 font-medium tracking-wide">
                        Automated Review Request System ⚙️
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        Build Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Review Funnel System</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Use the smartest <strong>review funnel software</strong> built inside a modern <strong>reputation management platform</strong>. We automatically capture negative feedback internally while rocketing positive ratings to Google.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] transition-all">
                            Create Your Funnel in 2 Minutes
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-16 prose prose-invert prose-lg border-t border-white/5">
                <h2 className="text-3xl font-bold text-white mb-6">Why You Need a Review Funnel With Negative Feedback Filter</h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    You cannot ask for reviews randomly anymore. It is far too risky. A perfectly constructed <strong>review automation software</strong> relies on a two-step gate. First, determine sentiment. Second, route intelligently. Let's break down the perfect funnel structure.
                </p>

                <h2 className="text-3xl font-bold text-white mb-6 mt-12">How the Funnel Works</h2>
                
                <div className="space-y-8">
                    <div className="p-8 bg-black/50 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-bold text-indigo-300 mb-3">Step 1: The Neutral Ask</h3>
                        <p className="text-gray-300">Your customer receives a link via SMS or Email: "How was your experience?" They tap 1 to 5 stars. This entirely replaces the dangerous habit of direct-linking to Google.</p>
                    </div>

                    <div className="p-8 bg-black/50 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-bold text-red-300 mb-3">Step 2: Negative Deflection</h3>
                        <p className="text-gray-300">Did they tap 1, 2, or 3 stars? The funnel instantly opens a private webform. You are now using the powerful feature to <strong>filter negative reviews privately</strong> straight into your inbox. The crisis is diverted.</p>
                    </div>

                    <div className="p-8 bg-black/50 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-bold text-emerald-300 mb-3">Step 3: Positive Acceleration</h3>
                        <p className="text-gray-300">Did they tap 4 or 5 stars? The funnel immediately bounces their browser straight into your live Google Maps rating box. Zero friction. Pure growth.</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-6 mt-12">The Best Review Funnel Tool for Agencies</h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    Marketing agencies use Review Dock precisely because it functions as the perfect <strong>review funnel tool for agencies</strong>. Setup multiple clients, customize branding, download SVGs for print, and monitor results in a beautiful dashboard. Deliver immediate ROI to local businesses without manual labor using our <strong>automated review request system</strong>.
                </p>
                <div className="text-center mt-12 mb-4 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 p-10 rounded-[2rem] border border-indigo-500/20">
                    <h3 className="text-2xl font-bold text-white mb-6">Start Scaling 5-Star Reviews Now</h3>
                    <Link to="/signup" className="inline-block px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg transition-colors shadow-xl">
                        Build Free Smart Funnel
                    </Link>
                </div>
            </section>
        </main>
    );
}
