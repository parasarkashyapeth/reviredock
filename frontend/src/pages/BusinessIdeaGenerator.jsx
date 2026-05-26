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
        .big-sit{transition:all .2s;cursor:pointer}
        .big-sit:hover{border-color:rgba(6,182,212,.45)!important;transform:translateY(-2px)}
        .big-skill{transition:all .18s;cursor:pointer;user-select:none}
        .big-skill:hover{transform:translateY(-2px)}
        .big-idea{transition:all .25s}
        .big-idea:hover{border-color:rgba(167,139,250,.4)!important;transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.35)}
        .big-cta-btn{transition:all .2s}
        .big-cta-btn:hover{transform:translateY(-1px);opacity:.9}
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

const IDEAS_DB = {
    student: [
        { name: 'Campus Notes Marketplace', icon: '📝', tags: ['writing','teaching'], income: '₹5,000–₹18,000/mo', first: '1–2 weeks', fit: 91, tools: ['Gumroad','Notion','Instagram'], steps: ['Pick 2–3 subjects you excel at and create structured PDF notes','Set up a Gumroad page and price at ₹49–₹99 per subject','Promote in college WhatsApp groups and Telegram'], desc: 'Sell organised study notes and cheatsheets to students. Zero startup cost.' },
        { name: 'Local Tutoring Service', icon: '🎓', tags: ['teaching'], income: '₹8,000–₹25,000/mo', first: '3–5 days', fit: 88, tools: ['Zoom','WhatsApp','Google Meet'], steps: ['List 2–3 subjects you can teach confidently','Post on neighbourhood Facebook groups and school boards','Offer first session free to build reviews'], desc: 'Tutor school students in your area. High demand, zero overhead, immediate income.' },
        { name: 'AI Resume Optimizer', icon: '🤖', tags: ['writing','marketing'], income: '₹6,000–₹20,000/mo', first: '1 week', fit: 84, tools: ['ChatGPT','Canva','LinkedIn'], steps: ['Create a sample before/after resume transformation as proof','Offer ₹299–₹599 reviews via DM on LinkedIn','Upsell LinkedIn profile optimisation at ₹999'], desc: 'Use AI tools to rewrite resumes for job seekers. High value, low effort per client.' },
        { name: 'Social Media Management', icon: '📱', tags: ['marketing','design','video'], income: '₹10,000–₹30,000/mo', first: '2 weeks', fit: 80, tools: ['Canva','Buffer','Instagram'], steps: ['Build 1–2 personal pages to show your content style','Cold pitch 5 local businesses offering a free 2-week trial','Close at ₹3,000–₹8,000/month per client'], desc: 'Manage Instagram and Facebook for local businesses. Recurring, scalable income.' },
    ],
    employed: [
        { name: 'Weekend Consulting Sprints', icon: '🚀', tags: ['sales','finance'], income: '₹15,000–₹50,000/mo', first: '2–3 weeks', fit: 90, tools: ['LinkedIn','Calendly','Zoom'], steps: ['Identify 1 problem you solve daily at work that others struggle with','Create a 90-min consulting sprint offer at ₹2,500–₹5,000','Post on LinkedIn twice a week and DM 10 people weekly'], desc: 'Package your expertise into weekend sessions. Use your 9-to-5 skills to earn on the side.' },
        { name: 'Niche Newsletter', icon: '📧', tags: ['writing','marketing'], income: '₹5,000–₹40,000/mo', first: '1 month', fit: 86, tools: ['Substack','ConvertKit','Twitter/X'], steps: ['Pick one topic you read about obsessively anyway','Send 4 issues before monetising — build trust first','Add a paid tier at ₹199/mo or sell sponsorships at 500+ subs'], desc: 'Weekly email newsletter on a topic you already follow. Passive recurring income.' },
        { name: 'No-Code Automation Service', icon: '⚙️', tags: ['dev','data'], income: '₹20,000–₹80,000/mo', first: '3 weeks', fit: 83, tools: ['Zapier','Make','Airtable'], steps: ['Learn Zapier or Make in one weekend (free)','List 5 common business workflows you can automate','Offer automation to SMEs starting at ₹5,000 per setup'], desc: 'Help businesses automate repetitive tasks. No coding needed — huge demand.' },
        { name: 'LinkedIn Ghostwriting', icon: '✍️', tags: ['writing','marketing'], income: '₹12,000–₹45,000/mo', first: '2 weeks', fit: 81, tools: ['Notion','LinkedIn','Grammarly'], steps: ['Write 30 posts for your own profile to develop a consistent voice','Reach out to founders offering a 2-week free trial','Close at ₹8,000–₹20,000/month per client'], desc: 'Write LinkedIn content for busy founders. One of the highest value per-hour side hustles.' },
    ],
    owner: [
        { name: 'Website Audit & Growth Service', icon: '🔍', tags: ['marketing','dev'], income: '₹25,000–₹1,00,000/mo', first: '1 week', fit: 94, tools: ['ReviewDock','SEMrush','Loom'], steps: ['Create a 5-point audit checklist (SEO, UX, speed, CTA, trust)','Record a 5-min Loom video audit for 10 local websites — send free','Upsell a full audit + implementation at ₹5,000–₹15,000'], desc: 'Offer website audits and growth reporting to other small businesses. High margin.' },
        { name: 'Review Growth Service', icon: '⭐', tags: ['marketing','sales'], income: '₹20,000–₹60,000/mo', first: '1 week', fit: 90, tools: ['ReviewDock','WhatsApp Business','QR codes'], steps: ['Sign up on ReviewDock and set up your review collection system','Offer it as a service to 10 local businesses at ₹2,500/mo','Add QR code printing as an upsell at ₹500 per location'], desc: 'Use ReviewDock to grow Google reviews for multiple local businesses. Highly recurring.' },
        { name: 'Local SEO Monthly Package', icon: '📍', tags: ['marketing','writing'], income: '₹30,000–₹90,000/mo', first: '2–3 weeks', fit: 87, tools: ['Google Business','Ubersuggest','ReviewDock'], steps: ['Bundle GMB optimisation + 2 blog posts + monthly report','Price at ₹4,000–₹8,000/month per business','Target restaurants, clinics, and salons — they buy fast'], desc: 'Recurring SEO retainer for local businesses. GMB, local citations, and content.' },
        { name: 'WhatsApp Retention Flows', icon: '💬', tags: ['marketing','sales'], income: '₹15,000–₹50,000/mo', first: '2 weeks', fit: 82, tools: ['WhatsApp Business API','Wati','Interakt'], steps: ['Learn one WhatsApp automation tool (Wati free trial)','Build a 5-message re-engagement sequence template','Sell to local businesses at ₹3,000–₹8,000 setup + ₹1,500/mo'], desc: 'Build automated WhatsApp sequences that bring back past customers.' },
    ],
    freelancer: [
        { name: 'Digital Template Shop', icon: '🛍️', tags: ['design','dev'], income: '₹8,000–₹40,000/mo', first: '3–4 weeks', fit: 92, tools: ['Gumroad','Figma','Canva'], steps: ['Create 5–10 templates in your niche (Notion, Figma, Canva)','List on Gumroad and Creative Market at ₹199–₹999 each','Drive traffic through Twitter and YouTube tutorials'], desc: 'Sell digital templates passively. Build once, sell forever. Great passive top-up income.' },
        { name: 'Paid Community / Cohort', icon: '🌐', tags: ['teaching','community'], income: '₹20,000–₹1,50,000/mo', first: '3–4 weeks', fit: 88, tools: ['WhatsApp','Circle','Graphy'], steps: ['Define one outcome your community helps members achieve','Start with a free cohort of 20 people — document everything','Launch paid cohorts at ₹999–₹4,999 per person'], desc: 'Run a structured paid group around your expertise. Highest-margin product you can build.' },
        { name: 'Content Repurposing Agency', icon: '♻️', tags: ['video','writing','marketing'], income: '₹25,000–₹80,000/mo', first: '1–2 weeks', fit: 85, tools: ['Descript','Opus Clip','Canva'], steps: ['Take one podcast and turn it into 10 short clips + 5 posts','Show the before/after as a case study on LinkedIn','Sell the repurposing retainer at ₹8,000–₹20,000/month'], desc: 'Turn long-form content into short clips and carousels. Creators pay well for this.' },
        { name: 'Landing Page Audits', icon: '🔎', tags: ['design','marketing'], income: '₹10,000–₹35,000/mo', first: '3–5 days', fit: 80, tools: ['ReviewDock','Loom','Notion'], steps: ['Create a 7-point landing page audit framework','DM 10 creators per day with a quick free tip about their page','Offer paid audits at ₹1,499–₹3,999 per review'], desc: 'Review and improve landing pages for creators and indie makers. Fast delivery, repeat clients.' },
    ],
    between: [
        { name: 'Freelance Project Sprint', icon: '⚡', tags: ['dev','design','writing'], income: '₹20,000–₹60,000/mo', first: '3–7 days', fit: 93, tools: ['Upwork','Fiverr','LinkedIn'], steps: ['Pick your top 1 skill and create a laser-focused Fiverr gig','Price slightly below market — win your first 5 reviews quickly','Raise rates and move to direct clients after month 1'], desc: 'Start freelancing immediately. Best way to generate income fast while figuring out next move.' },
        { name: 'Micro-SaaS or Tool', icon: '🛠️', tags: ['dev','data'], income: '₹10,000–₹2,00,000/mo', first: '4–8 weeks', fit: 79, tools: ['Bubble','Glide','Supabase'], steps: ['Find a recurring annoyance in your previous job and build a simple fix','Launch on Product Hunt and indie hacker communities','Charge ₹299–₹999/month with a free tier to grow'], desc: 'Build a small software tool solving a specific problem. No-code makes this faster than ever.' },
        { name: 'Career Pivot Cohort', icon: '🎯', tags: ['teaching','writing'], income: '₹15,000–₹80,000/mo', first: '3–4 weeks', fit: 76, tools: ['Graphy','YouTube','Telegram'], steps: ['Document your journey through your job transition as content','Build an audience around the skill you are pivoting into','Launch a 4-week cohort at ₹2,999–₹6,999 per student'], desc: 'Turn your career pivot into a course. Your story is your marketing.' },
        { name: 'Industry Consulting', icon: '🤝', tags: ['sales','finance'], income: '₹10,000–₹40,000/mo', first: '1–2 weeks', fit: 73, tools: ['LinkedIn','Calendly','Zoom'], steps: ['Write about why you left your job honestly — LinkedIn loves it','Offer resume + interview coaching to people in the same field','Charge ₹1,999–₹4,999 per coaching package'], desc: 'Your industry experience is valuable to others. Monetise it while you find your next move.' },
    ],
};

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
    const boost = skills.filter(s => idea.tags.includes(s)).length;
    const fit = Math.min(99, idea.fit + boost * 2);
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

                <button onClick={() => setOpen(o => !o)} style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {open ? '▲ Hide roadmap' : '▼ 3-step roadmap'}
                </button>

                {open && (
                    <div style={{ marginTop: 14, animation: 'bigFadeUp .2s ease' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                            {idea.steps.map((st, i) => (
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
                            {idea.tools.map(t => (
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
    { v: '5', l: 'profile types' }, { v: '20+', l: 'curated ideas' },
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

    const toggleSkill = id => setSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
    const ideas = useMemo(() => sit ? (IDEAS_DB[sit] || []) : [], [sit]);

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
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '.18em' }}>Searchiva · Business Advisor</span>
                </div>

                <h1 style={{ fontSize: 'clamp(32px,5vw,58px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 16 }}>
                    Find your perfect<br />
                    <span style={{ background: 'linear-gradient(135deg,#a78bfa 20%,#06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        business idea.
                    </span>
                </h1>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,.48)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 40px' }}>
                    Tell us your situation and skills. We'll suggest realistic side hustles, business ideas, and income sources — with income estimates, roadmaps, and tools.
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
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>Select all that apply — we boost your fit score for matching ideas.</p>
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
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>Helps us filter the most realistic ideas for your constraints.</p>

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

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setStep(1)} style={{ ...inputStyle, cursor: 'pointer', padding: '15px 20px', border: 'none' }}>←</button>
                                    <div style={{ flex: 1 }}>{nextBtn('✨ Generate My Ideas', () => setResults(true))}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Results */
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
                                        Ideas for {SITUATIONS.find(s => s.id === sit)?.icon} {SITUATIONS.find(s => s.id === sit)?.label}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{ideas.length} personalised ideas</h2>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.42)', marginTop: 4 }}>Sorted by fit score. Click any card to reveal the step-by-step roadmap.</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={() => { setResults(false); setStep(0); setSit(null); setSkills([]); }} style={{
                                    padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                                    borderRadius: 12, color: 'rgba(255,255,255,.65)',
                                }}>← Start over</button>
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
                            {ideas.map((idea, i) => <IdeaCard key={idea.name} idea={idea} index={i} skills={skills} />)}
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
        </main>
    );
}
