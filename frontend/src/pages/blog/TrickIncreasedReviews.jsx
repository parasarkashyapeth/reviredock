import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TrickIncreasedReviews() {
    useEffect(() => {
        document.title = "This Simple Trick Increased Our Google Reviews by 300% | Review Dock";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Discover the psychological trick that increased a local business's Google reviews by over 300% in just two weeks. Steal this exact script.");
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = "Discover the psychological trick that increased a local business's Google reviews by over 300% in just two weeks. Steal this exact script.";
            document.head.appendChild(meta);
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
            <header className="absolute top-0 w-full z-50 px-4 py-6 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Review Dock <span className="text-gray-500 font-normal text-sm">/ Blog</span>
                    </Link>
                    <Link to="/signup" className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all text-sm">
                        Get Started
                    </Link>
                </div>
            </header>

            <article className="max-w-3xl mx-auto px-4 pt-32 pb-20 prose prose-invert prose-lg">
                <div className="text-sm text-yellow-500 font-bold tracking-widest uppercase mb-4">Viral Strategy</div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                    This Simple Trick Increased Google Reviews by 300% in Two Weeks
                </h1>
                
                <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                        RD
                    </div>
                    <div>
                        <div className="font-bold text-white">Review Dock Growth Team</div>
                        <div className="text-gray-500 text-sm">5 min read • Growth Hacks</div>
                    </div>
                </div>

                <p className="lead text-xl text-gray-300">
                    We talked to a local auto detailing shop that went from getting 1 or 2 reviews a month, to landing <strong>45 five-star reviews</strong> in just 14 days. 
                    They didn't offer a discount. They didn't bribe their customers. They just changed <strong>one sentence</strong>.
                </p>

                <h2>The Mistake 90% of Businesses Make</h2>
                <p>
                    Most businesses ask for reviews like this:<br />
                    <em>"Hey, if you liked our service, please leave us a review!"</em>
                </p>
                <p>
                    The problem? It's easily forgotten. It requires cognitive load on the customer's part. They have to remember your business name, open Google, search for you, find the review button, and figure out what to say. 
                </p>

                <h2>The 300% "Reciprocity Hack"</h2>
                <p>
                    Here is exactly what the detailing shop switched to. As they handed the keys back to the customer, the owner said:
                </p>
                <blockquote className="bg-white/5 border-l-4 border-blue-500 p-6 rounded-r-xl italic text-gray-300">
                    "I personally handled your wax coating today. If you're happy with how it came out, my boss actually bonuses us $10 if you mention my name (John) in a quick Google review. I'm texting you the direct link right now so it only takes 5 seconds."
                </blockquote>

                <h3>Why this works so incredibly well:</h3>
                <ol>
                    <li><strong>The Favor:</strong> The customer feels they are doing a personal favor for 'John', not a faceless corporation.</li>
                    <li><strong>The Tangible Benefit:</strong> They know exactly what their action results in (a $10 bonus for the worker).</li>
                    <li><strong>ZERO Friction:</strong> John eliminated all friction by texting a <strong className="text-white">direct Google Review link</strong> to their phone before they even drove off the lot.</li>
                </ol>

                <h2>How to Implement This Today (Without a Team)</h2>
                <p>
                    Even if you're a solo founder or don't do bonuses, the core insight is: <strong>Direct link + Personal favor</strong>.
                </p>
                
                <p>
                    To generate a direct link that skips all the Google search steps and pops open the 5-star rating window immediately, you need the right tool. 
                </p>

                <div className="my-12 p-8 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl text-center">
                    <h3 className="text-2xl font-bold text-white mt-0 mb-4">Want a Direct Review Link in 30 Seconds?</h3>
                    <p className="text-gray-300 mb-6">Create a Review Dock account for free. Enter your business name, and we'll generate your direct SMS/Email link and a scannable QR code.</p>
                    <Link to="/signup" className="inline-block px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold no-underline transition-colors shadow-lg shadow-blue-500/25">
                        Get My Free Link Now
                    </Link>
                </div>

                <p>
                    Stop waiting for customers to organically think about reviewing you. Give them a reason, send them a link, and watch your local SEO ranking absolutely dominate your competitors.
                </p>
            </article>
        </main>
    );
}
