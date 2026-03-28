import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TrustpilotAlternative() {
    useEffect(() => {
        document.title = "The Best Trustpilot Alternative in 2024 | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Looking for a Trustpilot alternative? Review Dock is a modern, affordable, and feature-rich platform to manage Google reviews for less. Try it free today.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Looking for a Trustpilot alternative? Review Dock is a modern, affordable, and feature-rich platform to manage Google reviews for less. Try it free today.";
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
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        Start Your Free Trial
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-gray-300 font-medium">
                        Ditch the expensive contracts 📉
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        The #1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Trustpilot Alternative</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Tired of paying thousands a year just to collect your own customer reviews? 
                        Review Dock gives you powerful automation and reputation management without the outrageous enterprise price tag.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transition-all transform hover:-translate-y-1">
                            Switch to Review Dock Today
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="glass-card p-1 md:p-2 rounded-[2rem] bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 font-bold bg-white/5">
                                <th className="p-6 text-xl text-white">Features</th>
                                <th className="p-6 text-xl text-gray-400">Trustpilot</th>
                                <th className="p-6 text-xl text-orange-400">Review Dock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="p-6 text-gray-300 font-medium">Price</td>
                                <td className="p-6 text-gray-400 text-sm md:text-base">$3000+ / year</td>
                                <td className="p-6 text-white font-bold text-sm md:text-base">Affordable Monthly Plans & Free Tier</td>
                            </tr>
                            <tr className="bg-white/[0.01]">
                                <td className="p-6 text-gray-300 font-medium">Google Routing</td>
                                <td className="p-6 text-gray-400"><svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></td>
                                <td className="p-6 text-white"><svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                            </tr>
                            <tr>
                                <td className="p-6 text-gray-300 font-medium">Own Your Data</td>
                                <td className="p-6 text-gray-400">Locked In</td>
                                <td className="p-6 text-white">100% Yours</td>
                            </tr>
                            <tr className="bg-white/[0.01]">
                                <td className="p-6 text-gray-300 font-medium">Negative Review Interception</td>
                                <td className="p-6 text-gray-400"><svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></td>
                                <td className="p-6 text-white"><svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
                    <div>
                        <h3 className="text-3xl font-bold mb-4">You Don't Need Another Platform. You Need Google.</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            While Trustpilot builds its own SEO using your customers, Review Dock focuses 100% on boosting your Google Business rating. Google is where 90% of searches happen. Don't build their brand, build yours.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-4">No Long-Term Contracts</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            We don't lock you into aggressive 12-month enterprise sales contracts. We provide a beautiful, reliable software tool with completely transparent pricing and a free tier to get you started immediately.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
