import { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import API_URL from '../config/api'
// MeteorShower removed
import { IconDashboard, IconChart, IconQR, IconDiamond, IconSettings } from './Icons'

// Inject layout animations
const LAYOUT_KEYFRAMES_ID = 'layout-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(LAYOUT_KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = LAYOUT_KEYFRAMES_ID;
    style.textContent = `
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glassShine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes borderGlow {
            0%, 100% { border-color: rgba(255, 255, 255, 0.1); }
            50% { border-color: rgba(255, 255, 255, 0.25); }
        }
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.5); }
        }
        @keyframes dropdownFadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoGlow {
            0%, 100% { 
                filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
                transform: scale(1);
            }
            50% { 
                filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.7));
                transform: scale(1.02);
            }
        }
        @keyframes logoShimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
        }
        @keyframes navItemFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        @keyframes iconBounce {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(-5deg); }
            75% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes activeGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(139, 92, 246, 0.1); }
            50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 15px rgba(168, 85, 247, 0.2); }
        }
        @keyframes navbarShine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
        }
        @keyframes profileRing {
            0%, 100% { 
                box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
            }
            50% { 
                box-shadow: 0 0 0 4px rgba(139, 92, 246, 0);
            }
        }
        @keyframes slideInNav {
            0% { opacity: 0; transform: translateX(-20px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes anchorSway {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        @keyframes dockWave {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.06; }
            100% { transform: translateX(100%); opacity: 0; }
        }
        .nav-item-hover .nav-icon {
            transition: transform 0.3s ease, filter 0.3s ease;
        }
        .nav-item-hover:hover .nav-icon {
            animation: iconBounce 0.5s ease-in-out;
            filter: drop-shadow(0 0 6px rgba(165, 180, 252, 0.7));
        }
        .nav-item-hover:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(168, 85, 247, 0.14) 50%, rgba(192, 132, 252, 0.10) 100%) !important;
            border-color: rgba(139, 92, 246, 0.35) !important;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.15), 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08);
            transform: translateY(-1px);
            color: #e0e7ff !important;
            text-shadow: 0 0 12px rgba(165, 180, 252, 0.5);
        }
        @keyframes anchorSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes footerOrb1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
            33% { transform: translate(30px, -20px) scale(1.2); opacity: 0.25; }
            66% { transform: translate(-20px, 15px) scale(0.9); opacity: 0.1; }
        }
        @keyframes footerOrb2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
            50% { transform: translate(-40px, -10px) scale(1.3); opacity: 0.2; }
        }
        @keyframes footerShimmerLine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes footerGlowPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255,255,255,0.05); }
            50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.12), inset 0 1px 0 rgba(255,255,255,0.1); }
        }
        @keyframes footerLinkGlow {
            0%, 100% { text-shadow: 0 0 0px transparent; }
            50% { text-shadow: 0 0 8px rgba(139, 92, 246, 0.5); }
        }
        .footer-link {
            position: relative;
            transition: all 0.3s ease;
            text-shadow: 0 0 6px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.05);
        }
        .footer-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 0;
            height: 1px;
            background: linear-gradient(90deg, #8b5cf6, #a855f7);
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        .footer-link:hover::after {
            width: 100%;
        }
        .footer-link:hover {
            color: rgba(255,255,255,1) !important;
            text-shadow: 0 0 12px rgba(255,255,255,0.6), 0 0 30px rgba(139, 92, 246, 0.5);
        }
    `;
    document.head.appendChild(style);
}

export default function Layout({ children }) {
    const { user, logout, getToken } = useAuth()
    const navigate = useNavigate()
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const profileDropdownRef = useRef(null)
    const [showToolsDropdown, setShowToolsDropdown] = useState(false)
    const toolsDropdownRef = useRef(null)
    const [newFeedbackCount, setNewFeedbackCount] = useState(0)

    // Fetch new feedback count (last 24h unreplied) — poll every 60s, pause when tab hidden
    useEffect(() => {
        const fetchNewCount = async () => {
            try {
                const token = getToken?.()
                if (!token || !user?.businessId) return
                const res = await fetch(`${API_URL}/api/business/${user.businessId}/alerts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setNewFeedbackCount(data.unreadCount || 0)
                }
            } catch (err) { /* silent */ }
        }
        fetchNewCount()

        let interval = null
        const startPolling = () => {
            if (interval) clearInterval(interval)
            interval = setInterval(fetchNewCount, 60000)
        }
        const stopPolling = () => {
            if (interval) { clearInterval(interval); interval = null }
        }
        const handleVisibility = () => {
            if (document.hidden) { stopPolling() }
            else { fetchNewCount(); startPolling() }
        }

        startPolling()
        document.addEventListener('visibilitychange', handleVisibility)
        return () => {
            stopPolling()
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [user?.businessId])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close tools dropdown on outside click
    useEffect(() => {
        const handle = (e) => {
            if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
                setShowToolsDropdown(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Generate default avatar with initials
    const getDefaultAvatar = (name) => {
        const initial = (name || 'U').charAt(0).toUpperCase()
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#8b5cf6" width="100" height="100"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="40" font-family="Arial">${initial}</text></svg>`)}`
    }

    const navItems = useMemo(() => {
        const items = [
            { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard, badge: newFeedbackCount },
            { path: '/analytics', label: 'Analytics', Icon: IconChart },
            { path: '/qr-code', label: 'QR Code', Icon: IconQR },
            { path: '/pricing', label: 'Pricing', Icon: IconDiamond },
            { path: '/settings', label: 'Settings', Icon: IconSettings },
        ]
        if (user?.isAdmin) {
            items.push({ path: '/admin', label: 'Admin', Icon: () => <span style={{ fontSize: 16 }}>🛡️</span> })
        }
        return items
    }, [newFeedbackCount, user?.isAdmin])

    const toolItems = [
        { path: '/website-testing-report', label: 'Website Audit', icon: '🔍', desc: 'Free scan + ₹599 full report', color: '#06b6d4' },
        { path: '/business-idea-generator', label: 'Business Ideas', icon: '💡', desc: 'Find your perfect side hustle', color: '#a78bfa' },
        { path: '/blog/business-failure-case-studies', label: 'Case Studies', icon: '📉', desc: '12 real failure breakdowns', color: '#fb7185' },
    ]

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Top Navigation - Glass Effect */}
            <nav
                className="fixed top-0 left-0 right-0 z-50"
                style={{
                    background: 'rgba(10, 20, 40, 0.6)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    borderBottom: '1px solid rgba(100, 200, 255, 0.15)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(100, 200, 255, 0.05)',
                    overflow: 'visible',
                }}
            >
                {/* Animated shine effect across navbar */}
                <div
                    className="absolute top-0 h-full w-1/3 pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.08), transparent)',
                        animation: 'navbarShine 8s ease-in-out infinite',
                        zIndex: 0,
                    }}
                />
                {/* Bottom glow line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.4), rgba(150, 220, 255, 0.4), transparent)',
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ overflow: 'visible', zIndex: 10 }}>
                    <div className="flex justify-between h-16" style={{ overflow: 'visible' }}>
                        {/* Logo */}
                        <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 20 }}>
                            {/* Anchor icon */}
                            <span
                                className="text-2xl"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
                                    animation: 'anchorSpin 12s linear infinite',
                                    display: 'inline-block',
                                }}
                            >
                                ⚓
                            </span>
                            <span
                                className="text-2xl font-bold cursor-pointer relative"
                                style={{
                                    background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.5))',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                ReviewDock
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2" style={{ overflow: 'visible', position: 'relative', zIndex: 20 }}>
                            {navItems.map((item, index) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-item-hover px-4 py-2 rounded-xl font-medium flex items-center ${isActive ? '' : ''}`
                                    }
                                    style={({ isActive }) => ({
                                        transition: 'all 0.25s ease',
                                        ...(isActive ? {
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        } : {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            border: '1px solid transparent',
                                        }),
                                    })}
                                >
                                    <span className="nav-icon mr-2 flex items-center" style={{ display: 'inline-flex' }}>{item.Icon && <item.Icon className="w-5 h-5" />}</span>
                                    <span className="font-semibold tracking-wide relative" style={{ letterSpacing: '0.02em' }}>
                                        {item.label}
                                        {item.badge > 0 && (
                                            <span
                                                className="absolute -top-2 -right-5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white animate-pulse"
                                                style={{
                                                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                                                    padding: '0 4px',
                                                }}
                                            >
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </span>
                                </NavLink>
                            ))}

                            <div className="h-6 w-px bg-white/20 mx-2"></div>

                            {/* Free Tools — single dropdown button */}
                            <div ref={toolsDropdownRef} style={{ position: 'relative', zIndex: 200 }}>
                                <button
                                    onClick={() => setShowToolsDropdown(o => !o)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 14px', borderRadius: 12, cursor: 'pointer',
                                        fontSize: 13, fontWeight: 700,
                                        transition: 'all .22s ease',
                                        background: showToolsDropdown
                                            ? 'linear-gradient(135deg,rgba(6,182,212,.18),rgba(167,139,250,.14))'
                                            : 'rgba(255,255,255,.05)',
                                        border: showToolsDropdown
                                            ? '1px solid rgba(6,182,212,.4)'
                                            : '1px solid rgba(255,255,255,.12)',
                                        color: showToolsDropdown ? '#fff' : 'rgba(255,255,255,.72)',
                                        boxShadow: showToolsDropdown ? '0 0 18px rgba(6,182,212,.18)' : 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <span style={{ fontSize: 14 }}>🛠️</span>
                                    <span>Free Tools</span>
                                    <span style={{
                                        fontSize: 9, marginLeft: 2, opacity: .7,
                                        transform: showToolsDropdown ? 'rotate(180deg)' : 'none',
                                        transition: 'transform .2s',
                                        display: 'inline-block',
                                    }}>▼</span>
                                </button>

                                {/* Dropdown panel */}
                                {showToolsDropdown && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 230,
                                        background: 'rgba(6,10,20,.97)',
                                        border: '1px solid rgba(255,255,255,.1)',
                                        borderRadius: 16,
                                        padding: '8px',
                                        boxShadow: '0 24px 48px rgba(0,0,0,.7), 0 0 40px rgba(6,182,212,.06)',
                                        animation: 'dropdownFadeIn .18s ease',
                                        backdropFilter: 'blur(20px)',
                                    }}>
                                        {/* Caret notch */}
                                        <div style={{
                                            position: 'absolute', top: -6, left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 12, height: 12,
                                            background: 'rgba(6,10,20,.97)',
                                            border: '1px solid rgba(255,255,255,.1)',
                                            borderBottom: 'none', borderRight: 'none',
                                            rotate: '45deg',
                                        }} />
                                        <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.18em', padding: '4px 10px 8px', margin: 0 }}>Free tools</p>
                                        {toolItems.map(tool => (
                                            <NavLink
                                                key={tool.path}
                                                to={tool.path}
                                                onClick={() => setShowToolsDropdown(false)}
                                                style={({ isActive }) => ({
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '9px 12px', borderRadius: 10,
                                                    textDecoration: 'none', marginBottom: 4,
                                                    fontSize: 13, fontWeight: 700,
                                                    color: isActive ? tool.color : 'rgba(255,255,255,.72)',
                                                    background: isActive ? `${tool.color}12` : 'transparent',
                                                    border: `1px solid ${isActive ? tool.color + '30' : 'transparent'}`,
                                                    transition: 'all .15s',
                                                })}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = `${tool.color}10`
                                                    e.currentTarget.style.color = '#fff'
                                                    e.currentTarget.style.transform = 'translateX(2px)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'transparent'
                                                    e.currentTarget.style.color = 'rgba(255,255,255,.72)'
                                                    e.currentTarget.style.transform = 'none'
                                                }}
                                            >
                                                <span style={{
                                                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 15,
                                                    background: `${tool.color}14`,
                                                    border: `1px solid ${tool.color}30`,
                                                }}>{tool.icon}</span>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{tool.label}</p>
                                                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 500, lineHeight: 1.4 }}>{tool.desc}</p>
                                                </div>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-6 w-px bg-white/20 mx-2"></div>

                            {/* User Profile Section with Dropdown */}
                            <div className="relative" ref={profileDropdownRef} style={{ zIndex: 100 }}>
                                <button
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all duration-300 group relative"
                                    style={{
                                        background: showProfileDropdown ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        border: showProfileDropdown ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                        animation: showProfileDropdown ? 'activeGlow 2s ease-in-out infinite' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!showProfileDropdown) {
                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
                                            e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.3)'
                                            e.currentTarget.style.transform = 'translateY(-1px)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!showProfileDropdown) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                                            e.currentTarget.style.transform = 'translateY(0)'
                                        }
                                    }}
                                >
                                    <div className="relative">
                                        <img
                                            src={user?.profilePictureUrl || getDefaultAvatar(user?.ownerName || user?.businessName)}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover"
                                            style={{
                                                border: '2px solid rgba(139, 92, 246, 0.5)',
                                                boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
                                                animation: 'profileRing 4s ease-in-out infinite',
                                            }}
                                            onError={(e) => {
                                                e.target.src = getDefaultAvatar(user?.ownerName || user?.businessName)
                                            }}
                                        />
                                        {/* Setup nudge: orange dot if profile incomplete */}
                                        {!user?.businessName && (
                                            <span
                                                title="Complete your business profile"
                                                style={{
                                                    position: 'absolute', top: -2, right: -2,
                                                    width: 9, height: 9,
                                                    borderRadius: '50%',
                                                    background: '#f97316',
                                                    border: '1.5px solid #000',
                                                    boxShadow: '0 0 6px rgba(249,115,22,0.7)',
                                                    animation: 'pulse 2s ease-in-out infinite',
                                                }}
                                            />
                                        )}
                                    </div>
                                    <span className="text-sm text-white/90 font-semibold group-hover:text-white transition-colors duration-300">
                                        {user?.ownerName || user?.businessName}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-white/60 transition-all duration-300 group-hover:text-white/80 ${showProfileDropdown ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileDropdown && (
                                    <div
                                        className="absolute right-0 mt-2 w-60 rounded-xl"
                                        style={{
                                            zIndex: 9999,
                                            background: 'linear-gradient(135deg, rgba(15,15,35,0.99) 0%, rgba(10,10,28,0.99) 100%)',
                                            backdropFilter: 'blur(24px)',
                                            WebkitBackdropFilter: 'blur(24px)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
                                            animation: 'dropdownFadeIn 0.2s ease-out',
                                        }}
                                    >
                                        {/* Profile Info */}
                                        <div
                                            className="px-4 py-3.5"
                                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                                        >
                                            <p className="text-white font-semibold truncate text-sm">{user?.ownerName || user?.businessName}</p>
                                            <p className="text-white/40 text-xs truncate mt-0.5">{user?.email}</p>
                                        </div>

                                        {/* Dropdown Items */}
                                        <div className="py-1.5">
                                            {/* Settings link */}
                                            <NavLink
                                                to="/settings"
                                                onClick={() => setShowProfileDropdown(false)}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200 group"
                                                style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', display: 'flex' }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139,92,246,0.1)'
                                                    e.currentTarget.style.color = '#fff'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent'
                                                    e.currentTarget.style.color = 'rgba(255,255,255,0.72)'
                                                }}
                                            >
                                                <span style={{ fontSize: 15 }}>⚙️</span>
                                                <span className="text-sm font-medium">Settings</span>
                                            </NavLink>

                                            {/* Divider */}
                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 12px' }} />

                                            <button
                                                onClick={() => {
                                                    setShowProfileDropdown(false)
                                                    handleLogout()
                                                }}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                                style={{ color: '#f87171' }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent'
                                                }}
                                            >
                                                <span style={{ fontSize: 15 }}>🚪</span>
                                                <span className="text-sm font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                className="text-white/80 hover:text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                                onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    id="mobile-menu"
                    className="hidden md:hidden"
                    style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="px-4 py-3 space-y-2">
                        {/* Mobile Profile Section */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <img
                                src={user?.profilePictureUrl || getDefaultAvatar(user?.ownerName || user?.businessName)}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                                style={{
                                    border: '2px solid rgba(139, 92, 246, 0.5)',
                                }}
                                onError={(e) => {
                                    e.target.src = getDefaultAvatar(user?.ownerName || user?.businessName)
                                }}
                            />
                            <div>
                                <p className="text-white font-medium">{user?.ownerName || user?.businessName}</p>
                                <p className="text-white/50 text-sm">{user?.email}</p>
                            </div>
                        </div>

                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="block px-4 py-3 rounded-xl font-medium transition-all duration-300"
                                style={({ isActive }) => isActive ? {
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(236, 72, 153, 0.15) 100%)',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    color: '#e0e7ff',
                                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                                } : {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid transparent',
                                }}
                            >
                                <span className="mr-2 inline-flex">{item.Icon && <item.Icon className="w-5 h-5" />}</span>
                                {item.label}
                                {item.badge > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            color: 'white',
                                            minWidth: '20px',
                                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                                        }}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 rounded-xl font-medium mt-2"
                            style={{
                                color: '#f87171',
                                background: 'rgba(248, 113, 113, 0.1)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                            }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 pb-24">
                <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer
                className="relative z-10 border-t overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Animated wave line across footer top */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), rgba(168, 85, 247, 0.6), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'logoShimmer 4s linear infinite',
                    }}
                />
                {/* Shimmer sweep */}
                <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
                    <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'footerShimmerLine 3s ease-in-out infinite' }} />
                </div>

                {/* Subtle floating orbs */}
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', animation: 'footerOrb1 12s ease-in-out infinite' }} />
                <div className="absolute -bottom-12 right-10 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', animation: 'footerOrb2 10s ease-in-out infinite' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Brand */}
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        animation: 'anchorSpin 12s linear infinite',
                                        fontSize: '1.35rem',
                                    }}
                                >
                                    ⚓
                                </span>
                                <span
                                    className="text-xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 35%, #f472b6 65%, #fb7185 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.4))',
                                    }}
                                >
                                    ReviewDock
                                </span>
                            </div>
                            <p
                                className="text-white/80 text-sm text-center md:text-left"
                                style={{
                                    textShadow: '0 0 8px rgba(255,255,255,0.2), 0 0 25px rgba(255,255,255,0.08)',
                                }}
                            >
                                Smart review management for modern businesses
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm justify-center md:justify-start">
                            <NavLink to="/dashboard" className="footer-link text-white/80">Dashboard</NavLink>
                            <NavLink to="/analytics" className="footer-link text-white/80">Analytics</NavLink>
                            <NavLink to="/pricing" className="footer-link text-white/80">Pricing</NavLink>
                            <div className="w-px h-4 bg-white/15 hidden md:block" />
                            <NavLink to="/website-testing-report" className="footer-link" style={{ color: 'rgba(6,182,212,0.8)' }}>Website Audit</NavLink>
                            <NavLink to="/business-idea-generator" className="footer-link" style={{ color: 'rgba(167,139,250,0.8)' }}>Business Ideas</NavLink>
                            <NavLink to="/blog/business-failure-case-studies" className="footer-link" style={{ color: 'rgba(251,113,133,0.8)' }}>Case Studies</NavLink>
                        </div>

                        {/* Copyright */}
                        <div className="text-center md:text-right">
                            <p
                                className="text-white/70 text-xs"
                                style={{
                                    textShadow: '0 0 6px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.06)',
                                }}
                            >
                                © {new Date().getFullYear()} ReviewDock. All rights reserved.
                            </p>
                            <p
                                className="text-white/60 text-xs mt-1"
                                style={{
                                    textShadow: '0 0 8px rgba(255,255,255,0.2), 0 0 25px rgba(255,255,255,0.08)',
                                }}
                            >
                                Built with 💜 from 100xSolutions
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
