import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { businessCaseStudies } from '../data/businessCaseStudies';

/* ─── Keyframes ─────────────────────────────────────────────── */
const KF = 'bfs2-kf';
if (typeof document !== 'undefined' && !document.getElementById(KF)) {
    const s = document.createElement('style');
    s.id = KF;
    s.textContent = `
        @keyframes bfsFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bfsPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.18)}}
        @keyframes bfsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .bfs-card{transition:all .25s ease}
        .bfs-card:hover{transform:translateY(-2px);box-shadow:0 20px 48px rgba(0,0,0,.45)}
        .bfs-filter{transition:all .18s}
        .bfs-filter:hover{opacity:.85}
        .bfs-lesson{transition:background .18s}
        .bfs-lesson:hover{background:rgba(16,185,129,.08)!important}
    `;
    document.head.appendChild(s);
}

const CATEGORY_COLORS = {
    'Streaming': '#a78bfa', 'Logistics': '#60a5fa', 'Hardware': '#f59e0b',
    'Health / Fraud': '#f87171', 'Real Estate / SaaS': '#34d399', 'Social Media': '#fb7185',
    'Subscription': '#818cf8', 'E-commerce': '#06b6d4', 'Wearables': '#c084fc',
    'Services / Operations': '#4ade80', 'Productivity / Acquisition': '#fbbf24', 'EV / Infrastructure': '#22d3ee',
};

function Badge({ cat, small }) {
    const c = CATEGORY_COLORS[cat] || '#94a3b8';
    return (
        <span style={{
            fontSize: small ? 10 : 11, fontWeight: 700, color: c,
            background: `${c}16`, border: `1px solid ${c}3a`,
            borderRadius: 999, padding: small ? '2px 8px' : '3px 10px', display: 'inline-block', whiteSpace: 'nowrap',
        }}>{cat}</span>
    );
}

/* ─── Featured Hero Story ─────────────────────────────────────── */
function HeroStory({ story }) {
    const [open, setOpen] = useState(false);
    const c = CATEGORY_COLORS[story.category] || '#94a3b8';
    return (
        <article style={{
            border: `1px solid ${c}25`, borderRadius: 24, overflow: 'hidden',
            background: `linear-gradient(145deg,${c}08 0%,rgba(255,255,255,.02) 60%)`,
            marginBottom: 56, position: 'relative',
        }}>
            {/* top accent line */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${c},${c}55)` }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {/* Left */}
                <div style={{ padding: '36px 36px 36px 36px', borderRight: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 30, background: `${c}18`, border: `1px solid ${c}35`,
                        }}>{story.emoji}</div>
                        <div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 3 }}>Featured story</p>
                            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{story.company}</h2>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
                        <Badge cat={story.category} />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>📅 {story.yearsActive}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>💸 {story.raised}</span>
                    </div>
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,.68)', marginBottom: 24, fontStyle: 'italic' }}>"{story.tagline}"</p>

                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 10 }}>Why it failed</h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.58)', lineHeight: 1.75 }}>{story.whyFailed}</p>
                    </div>
                    <a href={story.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none', fontWeight: 600 }}>📎 {story.sourceLabel} ↗</a>
                </div>

                {/* Right */}
                <div style={{ padding: '36px' }}>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 12 }}>⚠️ Critical mistakes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {story.mistakes.map((m, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 10, alignItems: 'flex-start',
                                    padding: '8px 12px', borderRadius: 10,
                                    background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.12)',
                                }}>
                                    <span style={{ color: '#f59e0b', flexShrink: 0, fontSize: 12, marginTop: 1 }}>→</span>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.55, margin: 0 }}>{m}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setOpen(o => !o)} style={{
                        fontSize: 13, color: '#10b981', fontWeight: 700,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? 14 : 0,
                    }}>{open ? '▲ Hide lessons' : `▼ ${story.lessons.length} founder lessons`}</button>

                    {open && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'bfsFadeUp .2s ease' }}>
                            {story.lessons.map((l, i) => (
                                <div key={i} className="bfs-lesson" style={{
                                    display: 'flex', gap: 10, alignItems: 'flex-start',
                                    padding: '8px 12px', borderRadius: 10,
                                    background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.12)',
                                }}>
                                    <span style={{ color: '#10b981', flexShrink: 0, fontSize: 12, marginTop: 1 }}>✓</span>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, margin: 0 }}>{l}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

/* ─── Regular Story Card ─────────────────────────────────────── */
function StoryCard({ story, index }) {
    const [open, setOpen] = useState(false);
    const c = CATEGORY_COLORS[story.category] || '#94a3b8';
    return (
        <article className="bfs-card" style={{
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, overflow: 'hidden',
            background: 'rgba(255,255,255,.02)',
            animation: `bfsFadeUp .4s ease ${index * .06}s both`,
        }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${c},${c}55)` }} />
            <div style={{ padding: '22px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, background: `${c}16`, border: `1px solid ${c}30`,
                        }}>{story.emoji}</div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 5 }}>{story.company}</h2>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Badge cat={story.category} small />
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>📅 {story.yearsActive}</span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>💸 {story.raised}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{story.tagline}"</p>

                {/* Mistakes compact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {story.mistakes.slice(0, 2).map((m, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12 }}>
                            <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>
                            <span style={{ color: 'rgba(255,255,255,.52)', lineHeight: 1.5 }}>{m}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <button onClick={() => setOpen(o => !o)} style={{ fontSize: 12, color: c, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {open ? '▲ Collapse' : '▼ Full case study'}
                    </button>
                    <a href={story.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', textDecoration: 'none' }}>📎 source ↗</a>
                </div>

                {open && (
                    <div style={{ marginTop: 20, animation: 'bfsFadeUp .22s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>What they did</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.58)', lineHeight: 1.7 }}>{story.whatTheyDid}</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>Why it failed</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.58)', lineHeight: 1.7 }}>{story.whyFailed}</p>
                            </div>
                        </div>
                        {/* All mistakes */}
                        <h3 style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>All mistakes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                            {story.mistakes.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 11px', borderRadius: 9, background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.1)' }}>
                                    <span style={{ color: '#f59e0b', flexShrink: 0, fontSize: 11 }}>→</span>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.58)', lineHeight: 1.55, margin: 0 }}>{m}</p>
                                </div>
                            ))}
                        </div>
                        {/* Lessons */}
                        <h3 style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>Founder lessons</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {story.lessons.map((l, i) => (
                                <div key={i} className="bfs-lesson" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 11px', borderRadius: 9, background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.1)' }}>
                                    <span style={{ color: '#10b981', flexShrink: 0, fontSize: 11 }}>✓</span>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, margin: 0 }}>{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

/* ─── Filters ────────────────────────────────────────────────── */
const ALL_CATS = ['All', ...Object.keys(CATEGORY_COLORS)];

/* ─── Main ───────────────────────────────────────────────────── */
export default function BusinessFailureStories() {
    const [filter, setFilter] = useState('All');

    const available = useMemo(() => {
        const cats = new Set(businessCaseStudies.map(s => s.category));
        return ALL_CATS.filter(c => c === 'All' || cats.has(c));
    }, []);

    const filtered = useMemo(() =>
        filter === 'All' ? businessCaseStudies : businessCaseStudies.filter(s => s.category === filter),
        [filter]
    );

    const featured = businessCaseStudies[0];
    const rest = filter === 'All' ? businessCaseStudies.slice(1) : filtered;
    const showFeatured = filter === 'All';

    // Stats
    const totalRaised = useMemo(() => {
        const t = businessCaseStudies.reduce((sum, s) => {
            const n = parseFloat(s.raised.replace(/[^0-9.]/g, '')) || 0;
            const m = s.raised.includes('B') ? 1000 : 1;
            return sum + n * m;
        }, 0);
        return `$${(t / 1000).toFixed(1)}B+`;
    }, []);

    return (
        <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#030609,#04070e)', color: '#fff' }}>

            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px', height: 60,
                background: 'rgba(3,6,9,.85)', backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,.06)',
            }}>
                <Link to="/" style={{ textDecoration: 'none', fontWeight: 900, fontSize: 17 }}>
                    <span style={{ background: 'linear-gradient(135deg,#a78bfa,#c084fc,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ReviewDock</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Link to="/website-testing-report" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>Website Testing</Link>
                    <Link to="/business-idea-generator" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>Business Ideas</Link>
                    <Link to="/signup" style={{ fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#fb7185,#f43f5e)', color: '#fff', padding: '7px 16px', borderRadius: 10, textDecoration: 'none' }}>Start free</Link>
                </div>
            </nav>

            {/* Hero Header */}
            <section style={{ padding: '72px 32px 48px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: 640 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: 'rgba(251,113,133,.08)', border: '1px solid rgba(251,113,133,.28)',
                            borderRadius: 999, padding: '5px 14px', marginBottom: 22,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fb7185', animation: 'bfsPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#fda4af', textTransform: 'uppercase', letterSpacing: '.18em' }}>100xSolutions · Business Blog</span>
                        </div>

                        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 18 }}>
                            Companies that had<br />
                            <span style={{ background: 'linear-gradient(135deg,#fb7185 20%,#f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                everything — and failed.
                            </span>
                        </h1>

                        <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,.5)', marginBottom: 0 }}>
                            Deep-dive case studies for founders. Every company had money, talent, and an idea that worked — until it didn't. Read what went wrong and what you can apply to your own venture.
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { v: businessCaseStudies.length, l: 'case studies', c: '#fb7185' },
                            { v: totalRaised, l: 'capital destroyed', c: '#f59e0b' },
                            { v: `${available.length - 1}`, l: 'industries', c: '#a78bfa' },
                        ].map(s => (
                            <div key={s.l} style={{
                                padding: '14px 20px', borderRadius: 14, textAlign: 'right',
                                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                                minWidth: 150,
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Filters */}
            <section style={{ padding: '0 32px 28px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    display: 'flex', gap: 8, flexWrap: 'wrap',
                    padding: '14px 18px', borderRadius: 16,
                    background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
                }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, alignSelf: 'center', marginRight: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>Filter:</span>
                    {available.map(cat => {
                        const active = filter === cat;
                        const col = cat === 'All' ? '#fb7185' : (CATEGORY_COLORS[cat] || '#94a3b8');
                        return (
                            <button key={cat} onClick={() => setFilter(cat)} className="bfs-filter" style={{
                                padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                                fontSize: 12, fontWeight: 700,
                                background: active ? `${col}16` : 'rgba(255,255,255,.04)',
                                border: `1.5px solid ${active ? `${col}48` : 'rgba(255,255,255,.08)'}`,
                                color: active ? col : 'rgba(255,255,255,.42)',
                                boxShadow: active ? `0 0 14px ${col}20` : 'none',
                            }}>
                                {cat === 'All' ? `All (${businessCaseStudies.length})` : cat}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Stories */}
            <section style={{ padding: '0 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
                {/* Featured (only on "All" filter) */}
                {showFeatured && featured && <HeroStory story={featured} />}

                {/* Grid */}
                {rest.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,.28)' }}>No case studies in this category yet.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                        {rest.map((s, i) => <StoryCard key={s.company} story={s} index={i} />)}
                    </div>
                )}
            </section>

            {/* Bottom CTA strip */}
            <section style={{
                borderTop: '1px solid rgba(255,255,255,.07)',
                padding: '52px 32px',
                background: 'rgba(251,113,133,.025)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                            Don't let your website be the next cautionary tale.
                        </h2>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.42)' }}>
                            Every company above had a product — some failed because their digital presence was broken. Test yours now.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Link to="/business-idea-generator" style={{
                            padding: '13px 22px', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                            background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.28)',
                            borderRadius: 13, color: '#a78bfa',
                        }}>Generate business ideas →</Link>
                        <Link to="/website-testing-report" style={{
                            padding: '13px 22px', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                            background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                            borderRadius: 13, color: '#fff',
                            boxShadow: '0 0 24px rgba(6,182,212,.25)',
                        }}>Test my website — free →</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
