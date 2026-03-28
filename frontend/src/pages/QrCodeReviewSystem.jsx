import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function QrCodeReviewSystem() {
    useEffect(() => {
        document.title = "QR Code Review System for Restaurants & Retail | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Collect Google reviews effortlessly with our customizable QR code review system. Perfect for restaurants, clinics, cafes, and retail stores.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Collect Google reviews effortlessly with our customizable QR code review system. Perfect for restaurants, clinics, cafes, and retail stores.";
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
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Create Free QR Code
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 mt-10" id="main-heading">
                        Get Reviews from Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Physical Traffic</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Turn every table, checkout counter, and front desk into a 5-star review generating machine. 
                        Generate custom QR codes that drop customers right into the Google review rating screen.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/20 text-emerald-300 font-bold text-lg shadow-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all flex items-center gap-3 group">
                            <svg className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            Generate My Custom QR Code Free
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Instant Redirection</h3>
                        <p className="text-gray-400 leading-relaxed">Customers scan with their native camera and load the feedback form instantly—absolutely no app downloads or signups required.</p>
                    </div>
                    
                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20">
                            <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Smart Reputation Saver</h3>
                        <p className="text-gray-400 leading-relaxed">Protect your public score. 4 and 5-star ratings route straight to Google, while 1 to 3-star ratings route out to a private feedback form just for your eyes.</p>
                    </div>

                    <div className="glass-card p-8 bg-black/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">High Quality Downloads</h3>
                        <p className="text-gray-400 leading-relaxed">Generate ultra-high-resolution SVGs or PNGs ready for your local print shop to stamp on table tents, menus, or door decals.</p>
                    </div>
                </div>

                <div className="mt-20 text-center flex flex-col items-center p-12 bg-white/[0.03] rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none w-full h-full"></div>
                    <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Trusted By The Best Brick & Mortar Businesses</h2>
                    <p className="text-gray-400 max-w-2xl text-lg mb-10 relative z-10">We handle the technical routing and infrastructure. You focus on giving great service, and watch the reviews naturally flow in while customers wait for the check.</p>
                    <Link to="/signup" className="px-8 py-4 rounded-xl relative z-10 bg-white text-black font-extrabold hover:bg-gray-200 shadow-xl transition-all hover:scale-105">
                        Start Setting Up Your QR Code Today
                    </Link>
                </div>
            </section>
        </main>
    );
}
