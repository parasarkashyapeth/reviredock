import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ReviewLinkGenerator() {
    useEffect(() => {
        document.title = "Free Google Review Link Generator | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Generate a direct Google review link for your business instantly. Our free review link generator creates short links that maximize your 5-star ratings.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Generate a direct Google review link for your business instantly. Our free review link generator creates short links that maximize your 5-star ratings.";
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
                    <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        Get Your Link Free
                    </Link>
                </div>
            </header>

            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6" id="main-heading">
                        Free Google <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Review Link Generator</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Stop losing out on valuable customer feedback. Generate a short, direct Google Review link instantly. Send it via SMS, email, or WhatsApp to drive more 5-star ratings with zero friction.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link to="/signup" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 text-white font-bold text-lg shadow-xl hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all">
                            Create Your Direct Link Instantly &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1 glass-card p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Why You Need a Direct Review Link</h2>
                        <ul className="space-y-6 text-gray-300">
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Remove the Clunky Steps</strong>
                                    Don't ask customers to Google your name, find your business panel, and click 'Write a Review'. A direct link takes them straight to the star rating popup.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Increase Conversion Rates</strong>
                                    Short, clean links look trustworthy in SMS campaigns and email footers, dramatically increasing click-through and completion rates.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-full mr-4 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong className="text-white block mb-1">Use Everywhere</strong>
                                    Drop your link in WhatsApp chats, post-purchase thank-you pages, digital receipts, and social media bios.
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="order-1 md:order-2 flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 w-full max-w-sm glass-card border-none bg-black/40 p-6 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-lg font-bold">New Message</div>
                                <div className="text-purple-400 text-sm">Now</div>
                            </div>
                            <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-br-none mb-4 text-[15px] shadow-lg">
                                Hey there! We hope you loved your recent visit. Could you take 10 seconds to leave us a quick review here? <br /><br />
                                <span className="underline decoration-white/50 text-blue-100 font-semibold">reviewdock.co/b/your-business</span>
                            </div>
                            <div className="text-gray-400 text-xs text-center mt-2">Delivered to +1 555-0192</div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
