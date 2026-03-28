import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function GetMoreGoogleReviews() {
    useEffect(() => {
        document.title = "How to Get More Google Reviews in 2024 | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Learn the most effective strategies to get more Google reviews for your business. Increase your local SEO ranking and build trust with Review Dock.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Learn the most effective strategies to get more Google reviews for your business. Increase your local SEO ranking and build trust with Review Dock.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            {/* Simple Header */}
            <header className="absolute top-0 w-full z-50 px-4 py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Review Dock
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        Start Free
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        How to Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">More Google Reviews</span> (And Why It Matters)
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        In today's digital landscape, your Google rating is your reputation. Discover actionable strategies to systematically land 5-star reviews on autopilot and supercharge your local SEO.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 py-12 prose prose-invert prose-lg">
                <div className="glass-card p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Why Are Google Reviews So Critical?</h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Before a customer ever walks through your door or visits your website, they've likely searched for you on Google. Over 90% of consumers read online reviews before visiting a business. A steady stream of positive Google reviews acts as powerful social proof, directly influencing purchasing decisions and drastically improving your local search rankings.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 mt-12">Top Strategies to Increase Your Review Count</h2>
                    
                    <div className="space-y-8">
                        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
                            <h3 className="text-xl font-bold text-blue-300 mb-3">1. Ask at the Right Moment</h3>
                            <p className="text-gray-300">Timing is everything. Ask for a review immediately after a successful transaction or a positive customer service interaction. The experience is fresh in their mind, making them much more likely to leave a glowing rating.</p>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                            <h3 className="text-xl font-bold text-purple-300 mb-3">2. Make it Ridiculously Easy</h3>
                            <p className="text-gray-300">If a customer has to search for your Google Business Profile to leave a review, they won't do it. Provide a direct link. Using a tool like Review Dock lets you generate optimized links and QR codes that take users straight to the 5-star rating page.</p>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-pink-900/20 to-red-900/20 rounded-2xl border border-pink-500/20">
                            <h3 className="text-xl font-bold text-pink-300 mb-3">3. Automate the Process</h3>
                            <p className="text-gray-300">Don't rely on memory. Integrate review requests into your receipt emails, SMS follow-ups, or use physical QR code stands at your checkout counter. Automation ensures a consistent flow of fresh feedback.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 mt-12">The Smart Way to Manage Reviews</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        Getting reviews is only half the battle. You need a system to filter out negative experiences privately while pushing the 5-star experiences to Google. That's exactly what Review Dock's smart routing does, protecting your reputation while boosting your score.
                    </p>

                    <div className="text-center mt-12 mb-4">
                        <Link to="/signup" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all transform hover:-translate-y-1">
                            Start Automating Your Reviews Free
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
