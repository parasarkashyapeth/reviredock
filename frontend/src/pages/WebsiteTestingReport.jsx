import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─── Keyframes ─────────────────────────────────────────────── */
const KF = 'wtr2-kf';
if (typeof document !== 'undefined' && !document.getElementById(KF)) {
    const s = document.createElement('style');
    s.id = KF;
    s.textContent = `
        @keyframes wtrFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wtrPop{0%{opacity:0;transform:scale(.92)}100%{opacity:1;transform:scale(1)}}
        @keyframes wtrPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes wtrSpin{to{transform:rotate(360deg)}}
        @keyframes wtrShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes wtrFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes wtrNodePulse{0%,100%{box-shadow:0 0 0 0 currentColor}50%{box-shadow:0 0 0 5px transparent}}
        @keyframes wtrGlow{0%,100%{box-shadow:0 0 24px rgba(6,182,212,.2)}50%{box-shadow:0 0 48px rgba(6,182,212,.5)}}
        @keyframes wtrProgress{from{width:0}to{width:100%}}
        @keyframes wtrCountUp{from{opacity:0}to{opacity:1}}
        .wtr-card{transition:all .25s ease}
        .wtr-card:hover{border-color:rgba(6,182,212,.4)!important;transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
        .wtr-tool:hover .wtr-tool-arrow{transform:translateX(4px)}
        .wtr-tool-arrow{transition:transform .2s}
        .wtr-node:hover{transform:translate(-50%,-50%) scale(1.3)!important}
        .wtr-node{transition:transform .2s}
        .wtr-cat:hover{border-color:rgba(6,182,212,.45)!important;background:rgba(6,182,212,.06)!important}
        .wtr-cat{transition:all .2s}
    `;
    document.head.appendChild(s);
}

/* ─── helpers ─────────────────────────────────────────────────── */
function scoreFromUrl(url) {
    const clean = url.trim().toLowerCase();
    if (!clean) return null;
    const s = clean.split('').reduce((t, c) => t + c.charCodeAt(0), 0);
    return 54 + (s % 38);
}
function gradeFromScore(s) {
    if (s >= 85) return { label: 'A', color: '#10b981', bg: 'rgba(16,185,129,.12)', label2: 'Excellent' };
    if (s >= 72) return { label: 'B', color: '#06b6d4', bg: 'rgba(6,182,212,.12)', label2: 'Good' };
    if (s >= 58) return { label: 'C', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', label2: 'Needs Work' };
    return { label: 'D', color: '#f87171', bg: 'rgba(248,113,113,.12)', label2: 'Critical' };
}

/* ─── Score Ring ────────────────────────────────────────────── */
function ScoreRing({ score }) {
    const r = 72, circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const { label, color, label2 } = gradeFromScore(score);
    const [vis, setVis] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVis(true), 150); return () => clearTimeout(t); }, [score]);
    return (
        <div style={{ position: 'relative', width: 184, height: 184, margin: '0 auto', flexShrink: 0 }}>
            <svg width="184" height="184" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                <circle cx="92" cy="92" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="10" />
                <circle cx="92" cy="92" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circ}
                    strokeDashoffset={vis ? offset : circ}
                    style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 12px ${color}99)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>/ 100</span>
                <span style={{
                    marginTop: 8, fontSize: 13, fontWeight: 800,
                    padding: '3px 10px', borderRadius: 999,
                    background: gradeFromScore(score).bg,
                    color,
                }}>Grade {label} · {label2}</span>
            </div>
        </div>
    );
}

/* ─── Flow Visualization ─────────────────────────────────────── */
const NODES = [
    { id: 0, label: 'Root Domain', type: 'root', x: 50, y: 10, color: '#60a5fa', icon: '🌐' },
    { id: 1, label: 'Homepage', type: 'section', x: 18, y: 36, color: '#a78bfa', icon: '🏠' },
    { id: 2, label: 'Services', type: 'section', x: 50, y: 36, color: '#34d399', icon: '⚙️' },
    { id: 3, label: 'Pricing', type: 'cta', x: 82, y: 36, color: '#f59e0b', icon: '💰' },
    { id: 4, label: 'Blog / SEO', type: 'seo', x: 16, y: 66, color: '#22d3ee', icon: '📝' },
    { id: 5, label: 'Contact', type: 'cta', x: 40, y: 70, color: '#fb7185', icon: '📬' },
    { id: 6, label: 'Main CTA', type: 'cta', x: 66, y: 68, color: '#f472b6', icon: '🎯' },
    { id: 7, label: 'About', type: 'section', x: 84, y: 68, color: '#818cf8', icon: '👥' },
    { id: 8, label: 'Reviews', type: 'trust', x: 28, y: 90, color: '#4ade80', icon: '⭐' },
];
const EDGES = [[0,1],[0,2],[0,3],[1,4],[2,5],[2,6],[3,7],[4,8],[5,8]];
const NODE_TYPES = { root:'Root', section:'Page', cta:'CTA', seo:'SEO Page', trust:'Trust' };

function FlowViz({ url }) {
    const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'yourwebsite.com';
    const [drawn, setDrawn] = useState(false);
    const [hovered, setHovered] = useState(null);
    useEffect(() => { setDrawn(false); const t = setTimeout(() => setDrawn(true), 350); return () => clearTimeout(t); }, [url]);
    const nodes = useMemo(() => NODES.map((n, i) => ({ ...n, label: i === 0 ? domain : n.label })), [domain]);

    return (
        <div style={{
            position: 'relative', height: 350, borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(135deg,#060d1a 0%,#07111f 100%)',
            border: '1px solid rgba(255,255,255,.07)',
        }}>
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)',
                backgroundSize: '26px 26px',
            }} />
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                {EDGES.map(([f, t], i) => (
                    <line key={i}
                        x1={nodes[f].x} y1={nodes[f].y} x2={nodes[t].x} y2={nodes[t].y}
                        stroke={nodes[f].color} strokeWidth=".45" strokeOpacity={drawn ? .4 : 0}
                        strokeDasharray="200" strokeDashoffset={drawn ? 0 : 200}
                        style={{ transition: `stroke-dashoffset ${.5 + i * .08}s ease ${i * .06}s, stroke-opacity .4s ease ${i * .06}s` }}
                    />
                ))}
            </svg>
            {nodes.map((n, i) => (
                <div key={n.id} className="wtr-node"
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                        position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
                        transform: 'translate(-50%,-50%)',
                        opacity: drawn ? 1 : 0, zIndex: hovered === n.id ? 10 : 1,
                        transition: `opacity .4s ease ${i * .07}s`,
                    }}>
                    <div style={{
                        position: 'absolute', inset: -7, borderRadius: '50%',
                        border: `1.5px solid ${n.color}44`,
                        animation: 'wtrPulse 2.5s ease-in-out infinite',
                        animationDelay: `${i * .28}s`,
                    }} />
                    <div style={{
                        background: `${n.color}18`, border: `1.5px solid ${n.color}55`,
                        borderRadius: 11, padding: '4px 8px',
                        display: 'flex', alignItems: 'center', gap: 4,
                        boxShadow: `0 0 16px ${n.color}30`,
                        backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
                    }}>
                        <span style={{ fontSize: 9 }}>{n.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', maxWidth: 75, overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</span>
                    </div>
                    {hovered === n.id && (
                        <div style={{
                            position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                            transform: 'translateX(-50%)', background: 'rgba(8,16,32,.97)',
                            border: `1px solid ${n.color}55`, borderRadius: 8,
                            padding: '6px 10px', minWidth: 100, zIndex: 20,
                            animation: 'wtrFadeUp .15s ease',
                        }}>
                            <p style={{ fontSize: 10, color: n.color, fontWeight: 700, marginBottom: 1 }}>{NODE_TYPES[n.type]}</p>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>{n.label}</p>
                        </div>
                    )}
                </div>
            ))}
            <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9, color: 'rgba(255,255,255,.25)', fontWeight: 600 }}>
                Searchiva Tech Profiler
            </div>
        </div>
    );
}

/* ─── Category Insight Cards ─────────────────────────────────── */
const CATS = [
    { key: 'seo', label: 'SEO', icon: '🔍', color: '#06b6d4', adj: .9,
      insights: ['Add structured data (JSON-LD) to improve rich snippets', 'Strengthen internal linking between service pages', 'Meta descriptions missing on several pages', 'Build topical authority with a consistent blog strategy'] },
    { key: 'ux', label: 'User Experience', icon: '✨', color: '#a78bfa', adj: 1.05,
      insights: ['Primary CTA is below the fold on mobile — move it up', 'Trust signals should appear higher on the page', 'Add a sticky header to reduce navigation friction', 'Contact form has too many required fields'] },
    { key: 'perf', label: 'Performance', icon: '⚡', color: '#f59e0b', adj: .85,
      insights: ['Hero images uncompressed — convert to WebP format', 'Render-blocking scripts delay first contentful paint', 'No lazy loading on below-fold images', 'Core Web Vitals: LCP needs improvement'] },
    { key: 'features', label: 'Features', icon: '🚀', color: '#34d399', adj: 1.1,
      insights: ['Lead capture form missing from homepage', 'No live chat or chatbot for instant visitor support', 'Testimonials lack verified badges', 'Add comparison table vs competitors on pricing page'] },
    { key: 'competitors', label: 'Competitors', icon: '🎯', color: '#f472b6', adj: .95,
      insights: ['Top 3 competitors have deeper service page content', 'Competitor mobile speed is faster by ~1.2s', 'Pricing not clearly differentiated from alternatives', 'Missing social proof volume competitors highlight'] },
];

function CatCard({ cat, base }) {
    const [open, setOpen] = useState(false);
    const score = Math.min(100, Math.max(10, Math.round(base * cat.adj)));
    const barW = `${score}%`;
    return (
        <div className="wtr-cat" onClick={() => setOpen(o => !o)} style={{
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 16,
            cursor: 'pointer', background: 'rgba(255,255,255,.02)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 6 }}>{cat.label}</p>
                        <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,.07)', overflow: 'hidden', width: '100%' }}>
                            <div style={{
                                height: '100%', borderRadius: 4, width: barW,
                                background: cat.color, boxShadow: `0 0 8px ${cat.color}88`,
                                transition: 'width 1.3s cubic-bezier(.4,0,.2,1)',
                            }} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: cat.color, minWidth: 28, textAlign: 'right' }}>{score}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
                </div>
            </div>
            {open && (
                <ul style={{ marginTop: 14, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, animation: 'wtrFadeUp .2s ease' }}>
                    {cat.insights.map((t, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                            <span style={{ color: cat.color, flexShrink: 0 }}>→</span>{t}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ─── Demo Report Cards ─────────────────────────────────────── */
const DEMOS = [
    {
        name: 'Restaurant Website', emoji: '🍽️', type: 'Local Business', score: 72, grade: 'B', gc: '#06b6d4',
        summary: 'Menu is easy to find and the gallery builds trust. Slow images and missing review schema are costing significant local SEO rankings.',
        cats: { SEO: 58, UX: 79, Perf: 44, Features: 81, Competitors: 68 },
        wins: ['Menu easy to find on mobile', 'Google Maps link is prominent', 'WhatsApp button drives conversions'],
        fixes: ['Compress hero images (4MB → under 200KB)', 'Add LocalBusiness schema markup', 'Move reservation CTA above the fold'],
    },
    {
        name: 'SaaS Landing Page', emoji: '💻', type: 'Software Product', score: 64, grade: 'C', gc: '#f59e0b',
        summary: 'Clear product promise and a fast signup path. But the pricing page has no comparison table and feature proof lacks real user evidence.',
        cats: { SEO: 59, UX: 74, Perf: 61, Features: 55, Competitors: 71 },
        wins: ['Product promise clear in 8 words', 'Signup flow under 60 seconds', 'Pricing contrast is visually strong'],
        fixes: ['Add competitor comparison table', 'Replace stock photos with real screenshots', 'Create FAQ schema for SEO'],
    },
    {
        name: 'Local Clinic', emoji: '🏥', type: 'Healthcare', score: 81, grade: 'A', gc: '#10b981',
        summary: 'Strong service pages and clear location data give an excellent local SEO foundation. The main gap is mobile UX on the appointment booking flow.',
        cats: { SEO: 84, UX: 77, Perf: 72, Features: 85, Competitors: 80 },
        wins: ['Strong individual service pages', 'Clear location and hours', 'Trustworthy doctor testimonials'],
        fixes: ['Improve mobile tap targets on booking form', 'Create individual doctor profile pages', 'Optimise Google Business Profile integration'],
    },
    {
        name: 'E-commerce Store', emoji: '🛍️', type: 'Online Retail', score: 68, grade: 'C', gc: '#f59e0b',
        summary: 'Excellent product photography but checkout has too many steps. Fixing these two issues alone could increase conversion rate by 15–20%.',
        cats: { SEO: 63, UX: 59, Perf: 48, Features: 74, Competitors: 66 },
        wins: ['Product photography is excellent', 'Return policy clearly stated', 'Brand story page builds trust'],
        fixes: ['Reduce checkout from 5 steps to 3', 'Add product review schema for star snippets', 'Add exit-intent popup with discount'],
    },
];

function DemoCard({ d }) {
    const [exp, setExp] = useState(false);
    return (
        <article className="wtr-card" style={{
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 20,
            background: 'rgba(255,255,255,.025)', overflow: 'hidden',
        }}>
            {/* Top colour bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${d.gc},${d.gc}88)` }} />
            <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, background: `${d.gc}18`, border: `1px solid ${d.gc}35`,
                        }}>{d.emoji}</span>
                        <div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em' }}>{d.type}</p>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>{d.name}</h3>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: d.gc, filter: `drop-shadow(0 0 8px ${d.gc}88)`, lineHeight: 1 }}>{d.score}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Grade {d.grade}</div>
                    </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 14 }}>{d.summary}</p>
                {/* mini bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                    {Object.entries(d.cats).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', width: 72, flexShrink: 0 }}>{k}</span>
                            <div style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${v}%`, borderRadius: 3, background: v >= 75 ? '#10b981' : v >= 60 ? '#06b6d4' : '#f59e0b', transition: 'width 1.1s ease' }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', width: 22, textAlign: 'right' }}>{v}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setExp(o => !o)} style={{ fontSize: 12, color: d.gc, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: exp ? 14 : 0 }}>
                    {exp ? '▲ Hide details' : '▼ Full breakdown'}
                </button>
                {exp && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animation: 'wtrFadeUp .2s ease' }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 7 }}>✅ What's working</p>
                            {d.wins.map(w => <p key={w} style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 4 }}>+ {w}</p>)}
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 7 }}>🔧 Priority fixes</p>
                            {d.fixes.map(f => <p key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 4 }}>→ {f}</p>)}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

/* ─── Process Steps ──────────────────────────────────────────── */
const STEPS = [
    { n: '01', icon: '🔗', title: 'Paste your URL', desc: 'Enter any live website URL into the scanner — no setup, no account needed.' },
    { n: '02', icon: '⚡', title: 'Instant basic scan', desc: 'Get an immediate score across 5 dimensions with specific insights you can action today.' },
    { n: '03', icon: '📋', title: 'Submit for full audit', desc: 'Optionally submit for a ₹599 human-reviewed complete report.' },
    { n: '04', icon: '🚀', title: 'Get your growth roadmap', desc: 'Receive a prioritised action plan with screenshots, competitor notes, and expert recommendations.' },
];

/* ─── Included in full audit ─────────────────────────────────── */
const AUDIT_ITEMS = [
    { icon: '🔍', text: 'Technical health & Core Web Vitals' },
    { icon: '📈', text: 'SEO audit — titles, schema, links, indexation' },
    { icon: '📱', text: 'Mobile UX & conversion flow analysis' },
    { icon: '🚀', text: 'Feature completeness vs your goals' },
    { icon: '⚔️', text: 'Competitor positioning benchmarks' },
    { icon: '📄', text: 'Annotated screenshots & heatmap notes' },
    { icon: '🗺️', text: 'Prioritised action roadmap' },
    { icon: '⏰', text: 'Delivered within 24–48 hours as PDF' },
];

/* ─── MAIN ────────────────────────────────────────────────────── */
export default function WebsiteTestingReport() {
    const [url, setUrl] = useState('');
    const [submitted, setSubmitted] = useState('');
    const [scanning, setScanning] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [popup, setPopup] = useState(false);
    const [pName, setPName] = useState('');
    const [pEmail, setPEmail] = useState('');
    const [pUrl, setPUrl] = useState('');
    const [sent, setSent] = useState(false);
    const resultPanelRef = React.useRef(null);

    const score = useMemo(() => showReport ? scoreFromUrl(submitted) : null, [submitted, showReport]);

    const handleScan = e => {
        e.preventDefault();
        if (!url.trim()) return;
        setSubmitted(url.trim());
        setShowReport(false);
        setScanning(true);
        setPUrl(url.trim());
        // Scroll right panel into view on mobile
        setTimeout(() => {
            resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        setTimeout(() => {
            setScanning(false);
            setShowReport(true);
            setTimeout(() => setPopup(true), 800);
        }, 2400);
    };

    return (
        <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#030609 0%,#040810 40%,#050711 100%)', color: '#fff', fontFamily: 'inherit' }}>
            {/* ── Sticky Nav ──────────────────────────────────── */}
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
                    <Link to="/business-idea-generator" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>Business Ideas</Link>
                    <Link to="/blog/business-failure-case-studies" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>Case Studies</Link>
                    <Link to="/signup" style={{ fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', padding: '7px 16px', borderRadius: 10, textDecoration: 'none' }}>Start free</Link>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────── */}
            <section style={{ padding: '48px 32px 40px', maxWidth: 1200, margin: '0 auto' }}>
                {/* social proof bar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 20,
                        background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)',
                        borderRadius: 999, padding: '8px 20px', flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {[
                            { v: '2,400+', l: 'websites scanned' },
                            { v: '₹599', l: 'complete audit' },
                            { v: '24–48h', l: 'report delivery' },
                            { v: '5 areas', l: 'SEO, UX, Perf, Features, Competitors' },
                        ].map(s => (
                            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#06b6d4' }}>{s.v}</span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{s.l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                    {/* Left */}
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: 'rgba(6,182,212,.09)', border: '1px solid rgba(6,182,212,.28)',
                            borderRadius: 999, padding: '5px 14px', marginBottom: 22,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#06b6d4', animation: 'wtrPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#67e8f9', textTransform: 'uppercase', letterSpacing: '.18em' }}>Free Instant Website Scanner</span>
                        </div>

                        <h1 style={{ fontSize: 'clamp(34px,4.5vw,56px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 20 }}>
                            Know exactly<br />
                            <span style={{ background: 'linear-gradient(135deg,#06b6d4 30%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                what's killing<br />your website.
                            </span>
                        </h1>

                        <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,.52)', marginBottom: 32, maxWidth: 500 }}>
                            Paste any URL for a free instant scan across SEO, UX, performance, features, and competitors. Need deeper? Get a full human-reviewed audit in 24–48 hours for just ₹599.
                        </p>

                        {/* URL form */}
                        <form onSubmit={handleScan}>
                            <div style={{
                                display: 'flex', gap: 8,
                                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                                borderRadius: 16, padding: 8,
                                animation: 'wtrGlow 3s ease-in-out infinite',
                                flexWrap: 'wrap',
                            }}>
                                <input value={url} onChange={e => setUrl(e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    style={{
                                        flex: 1, minWidth: 180, background: 'rgba(0,0,0,.45)',
                                        border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
                                        padding: '12px 16px', fontSize: 14, color: '#fff', outline: 'none',
                                    }} />
                                <button type="submit" disabled={scanning} style={{
                                    padding: '12px 22px', background: scanning ? 'rgba(6,182,212,.35)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                                    border: 'none', borderRadius: 10, cursor: scanning ? 'not-allowed' : 'pointer',
                                    fontSize: 14, fontWeight: 800, color: '#fff',
                                    boxShadow: '0 0 20px rgba(6,182,212,.35)', whiteSpace: 'nowrap',
                                }}>
                                    {scanning ? '⏳ Scanning…' : '🔍 Scan for free'}
                                </button>
                            </div>
                        </form>

                        {/* Scanning progress */}
                        {scanning && (
                            <div style={{ marginTop: 16, animation: 'wtrFadeUp .3s ease' }}>
                                <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden', marginBottom: 12 }}>
                                    <div style={{
                                        height: '100%', borderRadius: 3, width: '100%',
                                        background: 'linear-gradient(90deg,#06b6d4,#a78bfa,#06b6d4)',
                                        backgroundSize: '200% 100%',
                                        animation: 'wtrShimmer 1.2s linear infinite',
                                    }} />
                                </div>
                                {['Checking technical health & Core Web Vitals…', 'Analysing SEO signals and meta structure…', 'Evaluating UX patterns and conversion flow…'].map((t, i) => (
                                    <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,.38)', lineHeight: 2, animation: `wtrFadeUp .4s ease ${i * .35}s both` }}>✓ {t}</p>
                                ))}
                            </div>
                        )}

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                            {['Free instant scan', '₹599 complete audit', '24–48h delivery', 'No login needed'].map(t => (
                                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,.38)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 999, padding: '4px 12px' }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Live Result Panel */}
                    <div ref={resultPanelRef} style={{
                        background: 'rgba(8,14,28,.97)', border: '1px solid rgba(6,182,212,.18)',
                        borderRadius: 24, padding: 24, boxShadow: '0 32px 64px rgba(0,0,0,.5)',
                        minHeight: 420, display: 'flex', flexDirection: 'column',
                    }}>

                        {scanning ? (
                            /* ── Scanning state ── */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'wtrFadeUp .3s ease' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', marginBottom: 20,
                                    border: '3px solid rgba(6,182,212,.15)',
                                    borderTop: '3px solid #06b6d4',
                                    animation: 'wtrSpin 1s linear infinite',
                                }} />
                                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Scanning {submitted}…</p>
                                <div style={{ height: 3, width: 220, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden', marginBottom: 16 }}>
                                    <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#06b6d4,#a78bfa,#06b6d4)', backgroundSize: '200% 100%', animation: 'wtrShimmer 1.2s linear infinite' }} />
                                </div>
                                {['Checking Core Web Vitals…', 'Analysing SEO signals…', 'Evaluating UX patterns…'].map((t, i) => (
                                    <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 2, animation: `wtrFadeUp .4s ease ${i * .35}s both` }}>✓ {t}</p>
                                ))}
                            </div>

                        ) : showReport && score ? (
                            /* ── User result ── */
                            <div style={{ animation: 'wtrPop .4s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div>
                                        <p style={{ fontSize: 10, color: '#67e8f9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em' }}>Your instant report</p>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', marginTop: 3, wordBreak: 'break-all' }}>{submitted}</p>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>✓ Done</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                                    <ScoreRing score={score} />
                                    <div>
                                        <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{score}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>/100</span></p>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 4, lineHeight: 1.6 }}>This instant scan gives a directional snapshot. Get a full expert audit for ₹599.</p>
                                        <button onClick={() => setPopup(true)} style={{
                                            marginTop: 12, padding: '10px 20px',
                                            background: 'linear-gradient(135deg,#06b6d4,#a78bfa)',
                                            border: 'none', borderRadius: 10, cursor: 'pointer',
                                            fontSize: 13, fontWeight: 800, color: '#fff',
                                            boxShadow: '0 0 20px rgba(6,182,212,.25)',
                                        }}>Get complete report — ₹599</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {CATS.map(cat => {
                                        const s = Math.min(100, Math.max(10, Math.round(score * cat.adj)));
                                        return (
                                            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontSize: 13 }}>{cat.icon}</span>
                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', width: 110, flexShrink: 0 }}>{cat.label}</span>
                                                <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${s}%`, borderRadius: 4, background: cat.color, boxShadow: `0 0 6px ${cat.color}88`, transition: 'width 1.3s cubic-bezier(.4,0,.2,1)' }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, width: 24, textAlign: 'right' }}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        ) : (
                            /* ── Default demo ── */
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'wtrPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '.14em' }}>Example output</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.38)' }}>mybakery.in</p>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 999, padding: '3px 9px' }}>✓ 2.4s</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                                    <ScoreRing score={74} />
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, lineHeight: 1.65 }}>Homepage clean, loads fast on desktop. Missing review schema and mobile CTA placement hurting conversions.</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {['+ Fast desktop load (1.1s)', '+ WhatsApp button visible', '→ Compress hero image (3.2MB)', '→ Add LocalBusiness schema'].map((w, i) => (
                                                <p key={i} style={{ fontSize: 11, color: w.startsWith('+') ? '#10b981' : '#f59e0b', lineHeight: 1.5 }}>{w}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
                                    {[
                                        { label: 'SEO', icon: '🔍', score: 66, color: '#06b6d4' },
                                        { label: 'User Experience', icon: '✨', score: 78, color: '#a78bfa' },
                                        { label: 'Performance', icon: '⚡', score: 63, color: '#f59e0b' },
                                        { label: 'Features', icon: '🚀', score: 82, color: '#34d399' },
                                        { label: 'Competitors', icon: '🎯', score: 71, color: '#f472b6' },
                                    ].map(cat => (
                                        <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 13 }}>{cat.icon}</span>
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', width: 110, flexShrink: 0 }}>{cat.label}</span>
                                            <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${cat.score}%`, borderRadius: 4, background: cat.color, boxShadow: `0 0 6px ${cat.color}88`, transition: 'width 1.3s cubic-bezier(.4,0,.2,1)' }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, width: 24, textAlign: 'right' }}>{cat.score}</span>
                                        </div>
                                    ))}
                                </div>

                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 14 }}>
                                    ↑ Enter your URL to get your real report instantly
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────── */}
            <section style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '64px 32px', background: 'rgba(255,255,255,.015)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 10 }}>How it works</p>
                        <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-.025em' }}>From URL to actionable insights in minutes</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                        {STEPS.map((step, i) => (
                            <div key={i} style={{
                                padding: '24px 20px', borderRadius: 20,
                                background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: 12, right: 14,
                                    fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,.04)', letterSpacing: '-.05em',
                                }}>{step.n}</div>
                                <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.48)', lineHeight: 1.65 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── DEMO REPORTS ─────────────────────────────────── */}
            <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8 }}>Sample reports</p>
                        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-.025em' }}>See exactly what you get back</h2>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.42)', marginTop: 8, maxWidth: 460 }}>Click any card to expand the full breakdown. This is the level of detail in your report.</p>
                    </div>
                    <Link to="/blog/business-failure-case-studies" style={{
                        fontSize: 13, fontWeight: 700, color: '#06b6d4', textDecoration: 'none',
                        border: '1px solid rgba(6,182,212,.3)', borderRadius: 10, padding: '8px 16px',
                    }}>Read business case studies →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                    {DEMOS.map(d => <DemoCard key={d.name} d={d} />)}
                </div>
            </section>

            {/* ── WHAT'S INCLUDED ──────────────────────────────── */}
            <section style={{
                borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)',
                padding: '64px 32px', background: 'rgba(6,182,212,.025)',
            }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8 }}>Complete audit — ₹599</p>
                        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900 }}>Everything in the full report</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginBottom: 36 }}>
                        {AUDIT_ITEMS.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '13px 16px', borderRadius: 12,
                                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                            }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', lineHeight: 1.5 }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <button onClick={() => setPopup(true)} style={{
                            padding: '16px 40px', fontSize: 16, fontWeight: 800,
                            background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                            border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                            boxShadow: '0 0 40px rgba(6,182,212,.35)',
                        }}>Request complete report — ₹599</button>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', marginTop: 12 }}>Expert reviewed · Delivered within 24–48 hours · PDF format</p>
                    </div>
                </div>
            </section>

            {/* ── TOOLS CROSS-LINK ─────────────────────────────── */}
            <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Link to="/business-idea-generator" style={{ textDecoration: 'none' }}>
                        <div className="wtr-tool" style={{
                            padding: '28px', borderRadius: 20, cursor: 'pointer',
                            background: 'rgba(167,139,250,.06)', border: '1px solid rgba(167,139,250,.2)',
                            display: 'flex', alignItems: 'center', gap: 20, transition: 'all .25s',
                        }}>
                            <span style={{ fontSize: 36, flexShrink: 0 }}>💡</span>
                            <div>
                                <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>Searchiva tool</p>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 5 }}>Business Idea Generator</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>Personalised side hustles & income ideas based on your profile</p>
                            </div>
                            <span className="wtr-tool-arrow" style={{ fontSize: 20, color: '#a78bfa', marginLeft: 'auto', flexShrink: 0 }}>→</span>
                        </div>
                    </Link>
                    <Link to="/blog/business-failure-case-studies" style={{ textDecoration: 'none' }}>
                        <div className="wtr-tool" style={{
                            padding: '28px', borderRadius: 20, cursor: 'pointer',
                            background: 'rgba(251,113,133,.05)', border: '1px solid rgba(251,113,133,.18)',
                            display: 'flex', alignItems: 'center', gap: 20, transition: 'all .25s',
                        }}>
                            <span style={{ fontSize: 36, flexShrink: 0 }}>📉</span>
                            <div>
                                <p style={{ fontSize: 11, color: '#fb7185', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>100xSolutions Blog</p>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 5 }}>Business Failure Case Studies</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>12 deep-dive stories: Theranos, WeWork, Vine, MoviePass & more</p>
                            </div>
                            <span className="wtr-tool-arrow" style={{ fontSize: 20, color: '#fb7185', marginLeft: 'auto', flexShrink: 0 }}>→</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ── POPUP ────────────────────────────────────────── */}
            {popup && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(14px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                }} onClick={e => { if (e.target === e.currentTarget) setPopup(false); }}>
                    <div style={{
                        width: '100%', maxWidth: 500,
                        background: 'linear-gradient(155deg,#0b1525,#0e1d30)',
                        border: '1px solid rgba(6,182,212,.22)', borderRadius: 28, padding: 36,
                        boxShadow: '0 48px 96px rgba(0,0,0,.7), 0 0 80px rgba(6,182,212,.06)',
                        animation: 'wtrPop .3s ease', position: 'relative',
                    }}>
                        <button onClick={() => setPopup(false)} style={{
                            position: 'absolute', top: 16, right: 16, width: 32, height: 32,
                            borderRadius: '50%', background: 'rgba(255,255,255,.07)',
                            border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16,
                        }}>×</button>

                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Request received!</h2>
                                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.52)', lineHeight: 1.7 }}>
                                    We'll reach out via email to confirm payment and begin your audit. Expect your full report within 24–48 hours.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: 10 }}>Complete website audit</p>
                                <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Submit your website URL</h2>
                                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.48)', lineHeight: 1.7, marginBottom: 22 }}>
                                    We'll manually test and deliver a complete expert report — SEO, UX, performance, competitors &amp; more — within 24–48 hours.
                                </p>
                                <div style={{
                                    background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)',
                                    borderRadius: 14, padding: '14px 18px', marginBottom: 22,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginBottom: 3 }}>Initial charge</p>
                                        <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>₹599 <span style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', fontWeight: 600 }}>/ website</span></p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Delivered in</p>
                                        <p style={{ fontSize: 14, fontWeight: 800 }}>24–48 hours</p>
                                    </div>
                                </div>
                                <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { v: pName, fn: setPName, ph: 'Your name', type: 'text' },
                                        { v: pEmail, fn: setPEmail, ph: 'Your email', type: 'email' },
                                        { v: pUrl, fn: setPUrl, ph: 'Website to audit (https://…)', type: 'url' },
                                    ].map(f => (
                                        <input key={f.ph} required value={f.v} type={f.type} onChange={e => f.fn(e.target.value)} placeholder={f.ph}
                                            style={{
                                                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                                                borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none',
                                            }} />
                                    ))}
                                    <button type="submit" style={{
                                        marginTop: 4, padding: '14px',
                                        background: 'linear-gradient(135deg,#06b6d4,#a78bfa)',
                                        border: 'none', borderRadius: 12, cursor: 'pointer',
                                        fontSize: 15, fontWeight: 800, color: '#fff',
                                        boxShadow: '0 0 30px rgba(6,182,212,.28)',
                                    }}>Request Complete Report — ₹599</button>
                                </form>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center', marginTop: 12 }}>Payment link sent via email after review</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
