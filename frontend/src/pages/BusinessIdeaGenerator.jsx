import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/* ─── Keyframes ─────────────────────────────────────────────── */
const KF = 'big2-kf';
if (typeof document !== 'undefined' && !document.getElementById(KF)) {
    const s = document.createElement('style');
    s.id = KF;
    s.textContent = `
        @keyframes bigFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bigPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes bigFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes bigShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes bigPop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes aiPulse{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.4)}70%{box-shadow:0 0 0 16px rgba(167,139,250,0)}}
        .big-sit{transition:all .2s;cursor:pointer}
        .big-sit:hover{border-color:rgba(6,182,212,.45)!important;transform:translateY(-2px)}
        .big-skill{transition:all .18s;cursor:pointer;user-select:none}
        .big-skill:hover{transform:translateY(-2px)}
        .big-idea{transition:all .25s}
        .big-idea:hover{border-color:rgba(167,139,250,.4)!important;transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.35)}
        .big-cta-btn{transition:all .2s}
        .big-cta-btn:hover{transform:translateY(-1px);opacity:.9}
        .ai-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:bigShimmer 1.5s ease-in-out infinite}
    `;
    document.head.appendChild(s);
}

/* ─── Data ──────────────────────────────────────────────────── */
const SITUATIONS = [
    { id: 'student', label: 'Student', icon: '🎓', desc: 'College / university' },
    { id: 'employed', label: 'Employed', icon: '💼', desc: 'Working 9-to-5' },
    { id: 'owner', label: 'Business Owner', icon: '🏢', desc: 'Running a business' },
    { id: 'freelancer', label: 'Freelancer', icon: '🌍', desc: 'Self-employed / gig' },
    { id: 'between', label: 'Career Change', icon: '🔄', desc: 'Looking for next step' },
];

const SKILLS = [
    { id: 'design', label: 'Design / UI', icon: '🎨' },
    { id: 'dev', label: 'Development', icon: '💻' },
    { id: 'marketing', label: 'Marketing', icon: '📢' },
    { id: 'sales', label: 'Sales', icon: '🤝' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'teaching', label: 'Teaching', icon: '📚' },
    { id: 'finance', label: 'Finance', icon: '📊' },
    { id: 'video', label: 'Video / Content', icon: '🎬' },
    { id: 'trade', label: 'Trade / Manual', icon: '🔧' },
    { id: 'data', label: 'Data / Analytics', icon: '📈' },
    { id: 'community', label: 'Community', icon: '🌐' },
    { id: 'photography', label: 'Photography', icon: '📸' },
];

const API_BASE = import.meta.env.VITE_API_URL || '';

/* ─── AI Loading Screen ──────────────────────────────────────── */
const AI_MESSAGES = [
    '🤖 Analyzing your profile…',
    '💡 Researching market opportunities…',
    '📊 Calculating income potential…',
    '🎯 Matching ideas to your skills…',
    '✨ Crafting your personalized plan…',
];

function AILoadingScreen() {
    const [msgIdx, setMsgIdx] = useState(0);

    React.useEffect(() => {
        const t = setInterval(() => {
            setMsgIdx(i => (i + 1) % AI_MESSAGES.length);
        }, 1400);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 420, animation: 'bigFadeUp .4s ease',
        }}>
            {/* Animated AI orb */}
            <div style={{
                position: 'relative', width: 96, height: 96, marginBottom: 32,
            }}>
                <div style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#a78bfa,#06b6d4,#e879f9)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 2s ease infinite, aiPulse 2s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38,
                }}>🧠</div>
                {/* Orbiting dot */}
                <div style={{
                    position: 'absolute', top: -4, left: '50%', transformOrigin: '0 52px',
                    animation: 'spin 1.5s linear infinite',
                    width: 10, height: 10,
                }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
                </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                AI is generating your ideas
            </h3>

            {/* Animated message */}
            <p key={msgIdx} style={{
                fontSize: 14, color: '#a78bfa', fontWeight: 600,
                animation: 'bigFadeUp .35s ease',
                marginBottom: 32, minHeight: 22,
            }}>{AI_MESSAGES[msgIdx]}</p>

            {/* Progress bar */}
            <div style={{
                width: 260, height: 4, borderRadius: 4,
                background: 'rgba(255,255,255,.07)', overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg,#a78bfa,#06b6d4,#e879f9)',
                    backgroundSize: '200% 100%',
                    animation: 'gradientShift 1.5s ease infinite, bigShimmer 2s ease infinite',
                    width: '100%',
                }} />
            </div>

            {/* Skeleton cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14, marginTop: 40, width: '100%', maxWidth: 680,
            }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        borderRadius: 18, overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,.06)',
                        background: 'rgba(255,255,255,.02)',
                        animationDelay: `${i * 0.12}s`,
                        animation: 'bigFadeUp .4s ease both',
                    }}>
                        <div style={{ height: 3, background: 'rgba(167,139,250,.15)' }} />
                        <div style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                                <div className="ai-shimmer" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="ai-shimmer" style={{ height: 14, borderRadius: 6, marginBottom: 8 }} />
                                    <div className="ai-shimmer" style={{ height: 11, borderRadius: 6, width: '75%' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <div className="ai-shimmer" style={{ height: 22, width: 100, borderRadius: 999 }} />
                                <div className="ai-shimmer" style={{ height: 22, width: 90, borderRadius: 999 }} />
                            </div>
                            <div className="ai-shimmer" style={{ height: 11, borderRadius: 6, width: '40%' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Step indicator ─────────────────────────────────────────── */
function StepBar({ step, total }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            {Array.from({ length: total }).map((_, i) => (
                <React.Fragment key={i}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        background: i < step ? 'linear-gradient(135deg,#06b6d4,#a78bfa)' : i === step ? 'rgba(6,182,212,.15)' : 'rgba(255,255,255,.06)',
                        border: i === step ? '1.5px solid #06b6d4' : '1.5px solid transparent',
                        color: i < step ? '#fff' : i === step ? '#06b6d4' : 'rgba(255,255,255,.28)',
                        transition: 'all .3s',
                    }}>{i < step ? '✓' : i + 1}</div>
                    {i < total - 1 && (
                        <div style={{
                            flex: 1, height: 2, borderRadius: 2,
                            background: i < step ? 'linear-gradient(90deg,#06b6d4,#a78bfa)' : 'rgba(255,255,255,.07)',
                            transition: 'background .4s',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ─── Idea Card ──────────────────────────────────────────────── */
function IdeaCard({ idea, index, skills }) {
    const [open, setOpen] = useState(false);
    const boost = skills.filter(s => (idea.tags || []).includes(s)).length;
    const fit = Math.min(99, (idea.fit || 80) + boost * 2);
    const fitColor = fit >= 88 ? '#10b981' : fit >= 78 ? '#06b6d4' : '#f59e0b';

    return (
        <article className="big-idea" style={{
            border: '1px solid rgba(167,139,250,.14)', borderRadius: 20, overflow: 'hidden',
            background: 'rgba(255,255,255,.02)',
            animation: `bigFadeUp .4s ease ${index * .07}s both`,
        }}>
            {/* Accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${fitColor},${fitColor}66)` }} />
            <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <span style={{
                        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                        background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                    }}>{idea.icon}</span>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{idea.name}</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.48)', lineHeight: 1.55 }}>{idea.desc}</p>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: fitColor, lineHeight: 1, filter: `drop-shadow(0 0 6px ${fitColor}88)` }}>{fit}%</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, marginTop: 1 }}>fit</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 999, padding: '3px 10px' }}>💰 {idea.income}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', borderRadius: 999, padding: '3px 10px' }}>⚡ First ₹ in {idea.first}</span>
                </div>

                {/* AI badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: '#a78bfa',
                        background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.2)',
                        borderRadius: 999, padding: '2px 8px', letterSpacing: '.05em',
                    }}>✨ AI Generated</span>
                </div>

                <button onClick={() => setOpen(o => !o)} style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {open ? '▲ Hide roadmap' : '▼ 3-step roadmap'}
                </button>

                {open && (
                    <div style={{ marginTop: 14, animation: 'bigFadeUp .2s ease' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                            {(idea.steps || []).map((st, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <span style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700,
                                        background: 'rgba(6,182,212,.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.25)',
                                    }}>{i + 1}</span>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', lineHeight: 1.55 }}>{st}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {(idea.tools || []).map(t => (
                                <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 6, padding: '2px 8px' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

/* ─── Stats bar ──────────────────────────────────────────────── */
const STATS = [
    { v: '5', l: 'profile types' }, { v: 'AI', l: 'powered ideas' },
    { v: '₹0', l: 'required to start' }, { v: '100%', l: 'personalised' },
];

/* ─── Main ───────────────────────────────────────────────────── */
export default function BusinessIdeaGenerator() {
    const [step, setStep] = useState(0);
    const [sit, setSit] = useState(null);
    const [skills, setSkills] = useState([]);
    const [time, setTime] = useState('5-10');
    const [budget, setBudget] = useState('low');
    const [results, setResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ideas, setIdeas] = useState([]);
    const [error, setError] = useState(null);

    const toggleSkill = id => setSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

    const generateIdeas = async () => {
        setLoading(true);
        setError(null);
        setResults(true);

        try {
            const res = await fetch(`${API_BASE}/api/business/generate-ideas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    situation: sit,
                    skills,
                    timePerWeek: time,
                    budget,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate ideas');
            }

            setIdeas(data.ideas || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none',
        transition: 'border-color .2s',
    };

    const nextBtn = (label, onClick, disabled = false) => (
        <button onClick={onClick} disabled={disabled} className="big-cta-btn" style={{
            width: '100%', padding: '15px',
            background: disabled ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg,#06b6d4,#a78bfa)',
            border: 'none', borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 800, color: disabled ? 'rgba(255,255,255,.25)' : '#fff',
            boxShadow: disabled ? 'none' : '0 0 28px rgba(6,182,212,.25)',
        }}>{label}</button>
    );

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
                    <Link to="/blog/business-failure-case-studies" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>Case Studies</Link>
                    <Link to="/signup" style={{ fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#8b5cf6)', color: '#fff', padding: '7px 16px', borderRadius: 10, textDecoration: 'none' }}>Start free</Link>
                </div>
            </nav>

            {/* Hero Header */}
            <section style={{ padding: '72px 32px 0', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(167,139,250,.09)', border: '1px solid rgba(167,139,250,.28)', borderRadius: 999, padding: '5px 14px', marginBottom: 22 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', animation: 'bigPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '.18em' }}>AI-Powered · Business Advisor</span>
                </div>

                <h1 style={{ fontSize: 'clamp(32px,5vw,58px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 16 }}>
                    Find your perfect<br />
                    <span style={{ background: 'linear-gradient(135deg,#a78bfa 20%,#06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        business idea.
                    </span>
                </h1>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,.48)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 40px' }}>
                    Tell us your situation and skills. Our AI generates realistic, personalised side hustles — with income estimates, roadmaps, and tools.
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 60, flexWrap: 'wrap' }}>
                    {STATS.map((s, i) => (
                        <div key={s.l} style={{
                            padding: '14px 28px',
                            borderTop: '1px solid rgba(255,255,255,.07)',
                            borderBottom: '1px solid rgba(255,255,255,.07)',
                            borderLeft: i === 0 ? '1px solid rgba(255,255,255,.07)' : 'none',
                            borderRight: '1px solid rgba(255,255,255,.07)',
                            borderRadius: i === 0 ? '12px 0 0 12px' : i === STATS.length - 1 ? '0 12px 12px 0' : 0,
                            textAlign: 'center', minWidth: 100,
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>{s.v}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Form / Results */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' }}>
                {!results ? (
                    <div style={{ maxWidth: 680, margin: '0 auto' }}>
                        <StepBar step={step} total={3} />

                        {/* Step 0: Situation */}
                        {step === 0 && (
                            <div style={{ animation: 'bigFadeUp .35s ease' }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>What's your current situation?</h2>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>This helps us pick the most realistic ideas for your context.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                                    {SITUATIONS.map(s => (
                                        <button key={s.id} onClick={() => setSit(s.id)} className="big-sit" style={{
                                            textAlign: 'left', padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
                                            background: sit === s.id ? 'rgba(6,182,212,.1)' : 'rgba(255,255,255,.03)',
                                            border: `1.5px solid ${sit === s.id ? 'rgba(6,182,212,.5)' : 'rgba(255,255,255,.08)'}`,
                                            boxShadow: sit === s.id ? '0 0 24px rgba(6,182,212,.12)' : 'none',
                                        }}>
                                            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: sit === s.id ? '#fff' : 'rgba(255,255,255,.8)' }}>{s.label}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{s.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                {nextBtn('Continue →', () => setStep(1), !sit)}
                            </div>
                        )}

                        {/* Step 1: Skills */}
                        {step === 1 && (
                            <div style={{ animation: 'bigFadeUp .35s ease' }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>What are your useful skills?</h2>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>Select all that apply — AI will boost your fit score for matching ideas.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                                    {SKILLS.map(sk => {
                                        const sel = skills.includes(sk.id);
                                        return (
                                            <button key={sk.id} onClick={() => toggleSkill(sk.id)} className="big-skill" style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '9px 15px', borderRadius: 999, cursor: 'pointer',
                                                background: sel ? 'rgba(167,139,250,.15)' : 'rgba(255,255,255,.04)',
                                                border: `1.5px solid ${sel ? 'rgba(167,139,250,.5)' : 'rgba(255,255,255,.1)'}`,
                                                fontSize: 13, fontWeight: 600,
                                                color: sel ? '#c4b5fd' : 'rgba(255,255,255,.58)',
                                                boxShadow: sel ? '0 0 14px rgba(167,139,250,.15)' : 'none',
                                            }}>
                                                <span>{sk.icon}</span><span>{sk.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setStep(0)} style={{ ...inputStyle, cursor: 'pointer', padding: '15px 20px', border: 'none' }}>←</button>
                                    <div style={{ flex: 1 }}>{nextBtn('Continue →', () => setStep(2))}</div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Time + Budget */}
                        {step === 2 && (
                            <div style={{ animation: 'bigFadeUp .35s ease' }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Time & starting budget</h2>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>Helps AI filter the most realistic ideas for your constraints.</p>

                                <div style={{ marginBottom: 22 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: 10 }}>Available time per week</p>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {['2-5', '5-10', '10-20', '20+'].map(t => (
                                            <button key={t} onClick={() => setTime(t)} style={{
                                                padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                                                background: time === t ? 'rgba(6,182,212,.12)' : 'rgba(255,255,255,.04)',
                                                border: `1.5px solid ${time === t ? 'rgba(6,182,212,.5)' : 'rgba(255,255,255,.1)'}`,
                                                color: time === t ? '#06b6d4' : 'rgba(255,255,255,.52)',
                                            }}>{t} hrs/wk</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 28 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: 10 }}>Starting budget</p>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {[{ id: 'zero', l: '₹0 (free)' }, { id: 'low', l: 'Under ₹5k' }, { id: 'medium', l: '₹5k–₹25k' }, { id: 'high', l: '₹25,000+' }].map(b => (
                                            <button key={b.id} onClick={() => setBudget(b.id)} style={{
                                                padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                                                background: budget === b.id ? 'rgba(167,139,250,.12)' : 'rgba(255,255,255,.04)',
                                                border: `1.5px solid ${budget === b.id ? 'rgba(167,139,250,.5)' : 'rgba(255,255,255,.1)'}`,
                                                color: budget === b.id ? '#a78bfa' : 'rgba(255,255,255,.52)',
                                            }}>{b.l}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI disclaimer */}
                                <div style={{
                                    marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                                    background: 'rgba(167,139,250,.05)', border: '1px solid rgba(167,139,250,.15)',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                    <span style={{ fontSize: 18 }}>🤖</span>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.55 }}>
                                        Our AI will generate 4 personalised business ideas based on your exact profile. This takes ~10 seconds.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setStep(1)} style={{ ...inputStyle, cursor: 'pointer', padding: '15px 20px', border: 'none' }}>←</button>
                                    <div style={{ flex: 1 }}>{nextBtn('✨ Generate My Ideas with AI', generateIdeas)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Results */
                    <div>
                        {loading ? (
                            /* AI Loading */
                            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                                <AILoadingScreen />
                            </div>
                        ) : error ? (
                            /* Error state */
                            <div style={{
                                maxWidth: 480, margin: '60px auto', textAlign: 'center',
                                animation: 'bigFadeUp .4s ease',
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Something went wrong</h3>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <button onClick={() => { setResults(false); setStep(2); setError(null); }} style={{
                                        padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                                        borderRadius: 12, color: 'rgba(255,255,255,.65)',
                                    }}>← Go back</button>
                                    <button onClick={generateIdeas} style={{
                                        padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                        background: 'linear-gradient(135deg,#06b6d4,#a78bfa)',
                                        border: 'none', borderRadius: 12, color: '#fff',
                                    }}>↺ Try again</button>
                                </div>
                            </div>
                        ) : (
                            /* Results grid */
                            <div style={{ animation: 'bigPop .4s ease' }}>
                                {/* Results header */}
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                                    marginBottom: 28, flexWrap: 'wrap', gap: 16,
                                }}>
                                    <div>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 7,
                                            background: 'rgba(167,139,250,.09)', border: '1px solid rgba(167,139,250,.25)',
                                            borderRadius: 999, padding: '4px 12px', marginBottom: 10,
                                        }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '.14em' }}>
                                                ✨ AI Ideas for {SITUATIONS.find(s => s.id === sit)?.icon} {SITUATIONS.find(s => s.id === sit)?.label}
                                            </span>
                                        </div>
                                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{ideas.length} AI-personalised ideas</h2>
                                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginTop: 4 }}>Generated by AI for your exact profile. Click any card to reveal the step-by-step roadmap.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <button onClick={() => { setResults(false); setStep(0); setSit(null); setSkills([]); setIdeas([]); }} style={{
                                            padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 12, color: 'rgba(255,255,255,.65)',
                                        }}>← Start over</button>
                                        <button onClick={generateIdeas} style={{
                                            padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.28)',
                                            borderRadius: 12, color: '#a78bfa',
                                        }}>✨ Regenerate</button>
                                        <Link to="/website-testing-report" style={{
                                            padding: '10px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                                            background: 'rgba(6,182,212,.1)', border: '1px solid rgba(6,182,212,.28)',
                                            borderRadius: 12, color: '#06b6d4',
                                        }}>Test your website →</Link>
                                    </div>
                                </div>

                                {/* Skill boost notice */}
                                {skills.length > 0 && (
                                    <div style={{
                                        marginBottom: 24, padding: '12px 18px', borderRadius: 14,
                                        background: 'rgba(167,139,250,.06)', border: '1px solid rgba(167,139,250,.18)',
                                        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Skills boosting your score:</span>
                                        {skills.map(sk => {
                                            const s = SKILLS.find(o => o.id === sk);
                                            return s ? <span key={sk} style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 700, background: 'rgba(167,139,250,.12)', borderRadius: 999, padding: '2px 10px' }}>{s.icon} {s.label}</span> : null;
                                        })}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                                    {ideas.map((idea, i) => <IdeaCard key={idea.name + i} idea={idea} index={i} skills={skills} />)}
                                </div>

                                {/* Cross-link CTA */}
                                <div style={{
                                    marginTop: 48, padding: '32px 36px',
                                    background: 'linear-gradient(135deg,rgba(6,182,212,.06),rgba(167,139,250,.06))',
                                    border: '1px solid rgba(6,182,212,.18)', borderRadius: 22,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 7 }}>Have a website already?</h3>
                                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)' }}>Test it now — free instant scan, then a full audit for ₹599.</p>
                                    </div>
                                    <Link to="/website-testing-report" style={{
                                        padding: '14px 26px', fontSize: 14, fontWeight: 800, textDecoration: 'none',
                                        background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff',
                                        borderRadius: 14, boxShadow: '0 0 24px rgba(6,182,212,.28)', flexShrink: 0,
                                    }}>Test your website — free →</Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
