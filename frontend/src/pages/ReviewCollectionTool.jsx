import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ReviewCollectionTool() {
    useEffect(() => {
        document.title = "The Best Review Collection Tool for Small Business | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Discover the ultimate review collection tool to automate and collect customer reviews easily. Features SMS, email, and a review collection tool with QR code.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Discover the ultimate review collection tool to automate and collect customer reviews easily. Features SMS, email, and a review collection tool with QR code.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            <header className="absolute top-0 w-full z-50 px-4 py-6 border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-500">
                        Review Dock
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Try It Free
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-emerald-500/30 mb-6 text-sm text-emerald-300 font-medium tracking-wide">
                        Rated #1 Customer Feedback Tool Online ⭐
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        The Only <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Review Collection Tool</span> You Need
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Are you using three different disconnected tools to text links and print flyers? Stop! Use the <strong>best review management software for small business</strong> and completely streamline your entire workflow today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4 px-4">
                        <Link to="/signup" className="px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all transform hover:-translate-y-1">
                            Start Collecting Today
                        </Link>
                        <Link to="/pricing" className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 text-white font-bold text-lg transition-all">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">The Ultimate Review Collection Strategy for Businesses</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Customer Review Request Software</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Automate the 'ask'. Let our <strong>customer review request software</strong> easily generate short URL links that you can paste directly into your SMS sequences or WhatsApp chatbots. Over 65% mobile open rates means faster growth.
                        </p>
                    </div>
                    
                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-blue-500/30 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                            <span className="text-2xl">🖼️</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Collect Reviews via QR Code Tool</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Every local store needs a <strong>review collection tool with qr code</strong>. Review Dock auto-generates high-definition branded QR codes. Print them on table tents or at your POS.
                        </p>
                    </div>

                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-purple-500/30 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Filter Negative Experiences</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Make sure you are capturing bad experiences internally. We are the premier <strong>collect customer reviews tool</strong> to intelligently intercept a 1-star scan automatically. Protect your public profile daily.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-16 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">How to get first 10 Google reviews</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        New business? The hardest part is the start. Don't worry, <strong>how to get reviews for new business</strong> starts with building trust among family, early adopters, and using a frictionless tool. Just send the custom Review Dock link you got after signup, and you'll hit 10 real reviews by the weekend.
                    </p>
                    <Link to="/signup" className="text-emerald-400 font-bold hover:underline">
                        Get Your Free 10-Review Booster Link →
                    </Link>
                </div>
            </section>
        </main>
    );
}
