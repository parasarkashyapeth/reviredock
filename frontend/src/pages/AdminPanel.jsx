import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

const API_URL = import.meta.env.VITE_API_URL || ''

// ── Stat Card ──
function StatCard({ label, value, icon, gradient, sub }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '24px 20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(139,92,246,0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.15)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* Gradient orb */}
            <div
                style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: gradient || 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                    filter: 'blur(15px)',
                    pointerEvents: 'none',
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 }}>{sub}</div>}
        </div>
    )
}

// ── Tab Button ──
function TabBtn({ active, label, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: active ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                background: active
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(168,85,247,0.15) 100%)'
                    : 'rgba(255,255,255,0.03)',
                color: active ? '#e0e7ff' : 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                }
            }}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    )
}

// ── Search Input ──
function SearchInput({ value, onChange, placeholder }) {
    return (
        <div style={{ position: 'relative', maxWidth: 320, width: '100%' }}>
            <svg
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '10px 16px 10px 40px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.1)'
                }}
                onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                }}
            />
        </div>
    )
}

// ── Pagination ──
function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                }}
            >
                ← Prev
            </button>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                }}
            >
                Next →
            </button>
        </div>
    )
}

// ── Confirm Modal ──
function ConfirmModal({ show, title, message, onConfirm, onCancel, danger }) {
    if (!show) return null
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
            }}
            onClick={onCancel}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(135deg, rgba(30,30,50,0.98) 0%, rgba(15,15,30,0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    padding: '32px',
                    maxWidth: 420,
                    width: '90%',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}
            >
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            border: 'none',
                            background: danger
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: danger
                                ? '0 4px 15px rgba(239,68,68,0.3)'
                                : '0 4px 15px rgba(139,92,246,0.3)',
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Mini Bar Chart ──
function MiniBarChart({ data, height = 120 }) {
    if (!data || data.length === 0) return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 20 }}>No data</div>
    const maxVal = Math.max(...data.map(d => (d.positive || 0) + (d.negative || 0) + (d.count || 0)), 1)

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height, padding: '0 4px' }}>
            {data.slice(-30).map((d, i) => {
                const total = (d.positive || 0) + (d.negative || 0) + (d.count || 0)
                const barH = (total / maxVal) * height
                const posH = d.positive ? (d.positive / maxVal) * height : barH
                const negH = d.negative ? (d.negative / maxVal) * height : 0

                return (
                    <div
                        key={i}
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, minWidth: 4, gap: 1 }}
                        title={`${d.date}: ${total}`}
                    >
                        {negH > 0 && (
                            <div style={{ height: negH, background: 'rgba(239,68,68,0.6)', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                        )}
                        <div style={{ height: posH || barH, background: 'rgba(139,92,246,0.6)', borderRadius: negH ? '0 0 2px 2px' : '2px', minHeight: 2 }} />
                    </div>
                )
            })}
        </div>
    )
}

// ════════════════════════════════════════════
// MAIN ADMIN PANEL
// ════════════════════════════════════════════
export default function AdminPanel() {
    const { user, getToken } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)

    // Data
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [feedbacks, setFeedbacks] = useState([])
    const [payments, setPayments] = useState([])

    // Pagination
    const [usersPage, setUsersPage] = useState(1)
    const [usersTotalPages, setUsersTotalPages] = useState(1)
    const [businessesPage, setBusinessesPage] = useState(1)
    const [businessesTotalPages, setBusinessesTotalPages] = useState(1)
    const [feedbacksPage, setFeedbacksPage] = useState(1)
    const [feedbacksTotalPages, setFeedbacksTotalPages] = useState(1)
    const [paymentsPage, setPaymentsPage] = useState(1)
    const [paymentsTotalPages, setPaymentsTotalPages] = useState(1)

    // Filters
    const [usersSearch, setUsersSearch] = useState('')
    const [businessesSearch, setBusinessesSearch] = useState('')
    const [feedbacksSearch, setFeedbacksSearch] = useState('')
    const [feedbacksType, setFeedbacksType] = useState('all')
    const [paymentsSearch, setPaymentsSearch] = useState('')
    const [paymentsStatus, setPaymentsStatus] = useState('all')

    // Modals
    const [confirmModal, setConfirmModal] = useState({ show: false })
    const [toast, setToast] = useState(null)

    const headers = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    }), [getToken])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    // ── Check admin access ──
    useEffect(() => {
        if (user && !user.isAdmin) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    // ── Fetch Stats ──
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats`, { headers: headers() })
            if (res.ok) {
                setStats(await res.json())
            }
        } catch (err) { console.error('Fetch stats error:', err) }
    }, [headers])

    // ── Fetch Users ──
    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users?page=${usersPage}&search=${usersSearch}`, { headers: headers() })
            if (res.ok) {
                const data = await res.json()
                setUsers(data.users)
                setUsersTotalPages(data.totalPages)
            }
        } catch (err) { console.error('Fetch users error:', err) }
    }, [headers, usersPage, usersSearch])

    // ── Fetch Businesses ──
    const fetchBusinesses = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/businesses?page=${businessesPage}&search=${businessesSearch}`, { headers: headers() })
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data.businesses)
                setBusinessesTotalPages(data.totalPages)
            }
        } catch (err) { console.error('Fetch businesses error:', err) }
    }, [headers, businessesPage, businessesSearch])

    // ── Fetch Feedbacks ──
    const fetchFeedbacks = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/feedbacks?page=${feedbacksPage}&type=${feedbacksType}&search=${feedbacksSearch}`, { headers: headers() })
            if (res.ok) {
                const data = await res.json()
                setFeedbacks(data.feedbacks)
                setFeedbacksTotalPages(data.totalPages)
            }
        } catch (err) { console.error('Fetch feedbacks error:', err) }
    }, [headers, feedbacksPage, feedbacksType, feedbacksSearch])

    // ── Fetch Payments ──
    const fetchPayments = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/payments?page=${paymentsPage}&status=${paymentsStatus}&search=${paymentsSearch}`, { headers: headers() })
            if (res.ok) {
                const data = await res.json()
                setPayments(data.payments)
                setPaymentsTotalPages(data.totalPages)
            }
        } catch (err) { console.error('Fetch payments error:', err) }
    }, [headers, paymentsPage, paymentsStatus, paymentsSearch])

    // ── Initial Load ──
    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await fetchStats()
            setLoading(false)
        }
        if (user?.isAdmin) load()
    }, [user, fetchStats])

    // ── Tab-specific loading ──
    useEffect(() => {
        if (activeTab === 'users') fetchUsers()
    }, [activeTab, fetchUsers])

    useEffect(() => {
        if (activeTab === 'businesses') fetchBusinesses()
    }, [activeTab, fetchBusinesses])

    useEffect(() => {
        if (activeTab === 'feedbacks') fetchFeedbacks()
    }, [activeTab, fetchFeedbacks])

    useEffect(() => {
        if (activeTab === 'payments') fetchPayments()
    }, [activeTab, fetchPayments])

    // ── Actions ──
    const handleDeleteUser = (userId, email) => {
        setConfirmModal({
            show: true,
            title: 'Delete User',
            message: `Are you sure you want to delete "${email}"? This will also remove their business and all feedback data. This action cannot be undone.`,
            danger: true,
            onConfirm: async () => {
                setConfirmModal({ show: false })
                try {
                    const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: headers() })
                    if (res.ok) {
                        showToast('User deleted')
                        fetchUsers()
                        fetchStats()
                    } else {
                        const data = await res.json()
                        showToast(data.error || 'Failed to delete', 'error')
                    }
                } catch { showToast('Failed to delete user', 'error') }
            },
        })
    }

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-admin`, {
                method: 'PATCH',
                headers: headers(),
            })
            if (res.ok) {
                showToast(currentStatus ? 'Admin removed' : 'Admin granted')
                fetchUsers()
            } else {
                const data = await res.json()
                showToast(data.error || 'Failed', 'error')
            }
        } catch { showToast('Failed to toggle admin', 'error') }
    }

    const handleDeleteBusiness = (bizId, name) => {
        setConfirmModal({
            show: true,
            title: 'Delete Business',
            message: `Delete business "${name}" and ALL associated users, feedbacks, and platforms? This cannot be undone.`,
            danger: true,
            onConfirm: async () => {
                setConfirmModal({ show: false })
                try {
                    const res = await fetch(`${API_URL}/api/admin/businesses/${bizId}`, { method: 'DELETE', headers: headers() })
                    if (res.ok) {
                        showToast('Business deleted')
                        fetchBusinesses()
                        fetchStats()
                    } else {
                        const data = await res.json()
                        showToast(data.error || 'Failed to delete', 'error')
                    }
                } catch { showToast('Failed to delete', 'error') }
            },
        })
    }

    const handleChangePlan = async (bizId, newPlan) => {
        try {
            const limits = { free: 50, starter: 200, pro: 1000, enterprise: 99999 }
            const res = await fetch(`${API_URL}/api/admin/businesses/${bizId}/plan`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ plan: newPlan, feedbackLimit: limits[newPlan] || 50 }),
            })
            if (res.ok) {
                showToast(`Plan updated to ${newPlan}`)
                fetchBusinesses()
            }
        } catch { showToast('Failed to update plan', 'error') }
    }

    const handleDeleteFeedback = (fbId) => {
        setConfirmModal({
            show: true,
            title: 'Delete Feedback',
            message: 'Permanently delete this feedback entry?',
            danger: true,
            onConfirm: async () => {
                setConfirmModal({ show: false })
                try {
                    const res = await fetch(`${API_URL}/api/admin/feedbacks/${fbId}`, { method: 'DELETE', headers: headers() })
                    if (res.ok) {
                        showToast('Feedback deleted')
                        fetchFeedbacks()
                        fetchStats()
                    }
                } catch { showToast('Failed to delete', 'error') }
            },
        })
    }

    // ── If not admin, show nothing ──
    if (!user?.isAdmin) return null

    // ── Loading State ──
    if (loading) {
        return (
            <Layout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '3px solid rgba(139,92,246,0.2)',
                        borderTopColor: '#8b5cf6',
                        animation: 'spin 1s linear infinite',
                    }} />
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </Layout>
        )
    }

    return (
        <Layout>
            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        top: 80,
                        right: 24,
                        zIndex: 100000,
                        padding: '14px 24px',
                        borderRadius: 12,
                        background: toast.type === 'error'
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))'
                            : 'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.95))',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        animation: 'fadeInUp 0.3s ease-out',
                    }}
                >
                    {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                danger={confirmModal.danger}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>🛡️</span>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Admin Panel
                    </h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    Manage users, businesses, and monitor platform activity
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                <TabBtn active={activeTab === 'overview'} label="Overview" icon="📊" onClick={() => setActiveTab('overview')} />
                <TabBtn active={activeTab === 'users'} label="Users" icon="👥" onClick={() => setActiveTab('users')} />
                <TabBtn active={activeTab === 'businesses'} label="Businesses" icon="🏢" onClick={() => setActiveTab('businesses')} />
                <TabBtn active={activeTab === 'feedbacks'} label="Feedbacks" icon="💬" onClick={() => setActiveTab('feedbacks')} />
                <TabBtn active={activeTab === 'payments'} label="Payments" icon="💵" onClick={() => setActiveTab('payments')} />
            </div>

            {/* ══════════════════════════════════ OVERVIEW ══════════════════════════════════ */}
            {activeTab === 'overview' && stats && (
                <div>
                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                        <StatCard
                            label="Total Users"
                            value={stats.totalUsers}
                            icon="👥"
                            gradient="radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)"
                            sub={`+${stats.newUsersLast7Days} this week`}
                        />
                        <StatCard
                            label="Businesses"
                            value={stats.totalBusinesses}
                            icon="🏢"
                            gradient="radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)"
                        />
                        <StatCard
                            label="Total Feedbacks"
                            value={stats.totalFeedbacks}
                            icon="💬"
                            gradient="radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)"
                            sub={`+${stats.newFeedbacksLast7Days} this week`}
                        />
                        <StatCard
                            label="Positive"
                            value={stats.positiveFeedbacks}
                            icon="😊"
                            gradient="radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)"
                            sub={stats.totalFeedbacks > 0 ? `${Math.round((stats.positiveFeedbacks / stats.totalFeedbacks) * 100)}% rate` : '—'}
                        />
                        <StatCard
                            label="Negative"
                            value={stats.negativeFeedbacks}
                            icon="😟"
                            gradient="radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)"
                        />
                        <StatCard
                            label="24h Activity"
                            value={stats.feedbacksLast24h}
                            icon="⚡"
                            gradient="radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)"
                        />
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                        {/* Signup Trend */}
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16,
                                padding: 20,
                            }}
                        >
                            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📈 Signups (30 days)</h3>
                            <MiniBarChart data={stats.signupTrend} height={100} />
                        </div>

                        {/* Feedback Trend */}
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16,
                                padding: 20,
                            }}
                        >
                            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>💬 Feedback (30 days)</h3>
                            <MiniBarChart data={stats.feedbackTrend} height={100} />
                        </div>
                    </div>

                    {/* Subscription Plans */}
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 16,
                            padding: 20,
                        }}
                    >
                        <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>💎 Subscription Breakdown</h3>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            {Object.entries(stats.subscriptionPlans).map(([plan, count]) => (
                                <div
                                    key={plan}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: 12,
                                        background: plan === 'free' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        minWidth: 100,
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{count}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize', marginTop: 4 }}>{plan}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════ USERS ══════════════════════════════════ */}
            {activeTab === 'users' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        <SearchInput value={usersSearch} onChange={v => { setUsersSearch(v); setUsersPage(1) }} placeholder="Search by email or name..." />
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{users.length} shown</span>
                    </div>

                    {/* Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['User', 'Email', 'Business', 'Plan', 'Admin', 'Joined', 'Actions'].map(h => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr
                                        key={u.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img
                                                    src={u.profile_picture_url || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="#8b5cf6" width="40" height="40" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${(u.owner_name || u.email || 'U').charAt(0).toUpperCase()}</text></svg>`)}`}
                                                    alt=""
                                                    style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.3)', objectFit: 'cover' }}
                                                />
                                                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{u.owner_name || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{u.email}</td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{u.businesses?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                                                background: (u.businesses?.subscription_plan === 'pro' || u.businesses?.subscription_plan === 'paid')
                                                    ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                                                color: (u.businesses?.subscription_plan === 'pro' || u.businesses?.subscription_plan === 'paid')
                                                    ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}>
                                                {u.businesses?.subscription_plan || 'free'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {u.is_admin ? (
                                                <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>🛡️ Yes</span>
                                            ) : (
                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                                                    title={u.is_admin ? 'Remove admin' : 'Make admin'}
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                                                        cursor: 'pointer', fontSize: 12,
                                                    }}
                                                >
                                                    {u.is_admin ? '⬇️' : '⬆️'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                                    title="Delete user"
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                                                        background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                                        cursor: 'pointer', fontSize: 12,
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No users found</div>
                    )}

                    <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                </div>
            )}

            {/* ══════════════════════════════════ BUSINESSES ══════════════════════════════════ */}
            {activeTab === 'businesses' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        <SearchInput value={businessesSearch} onChange={v => { setBusinessesSearch(v); setBusinessesPage(1) }} placeholder="Search by name or category..." />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Business', 'Category', 'Plan', 'Feedbacks', 'Usage', 'Users', 'Created', 'Actions'].map(h => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)',
                                                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                                                borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {businesses.map(b => {
                                    const usagePercent = b.monthly_feedback_limit > 0
                                        ? Math.round((b.monthly_feedback_count / b.monthly_feedback_limit) * 100)
                                        : 0

                                    return (
                                        <tr
                                            key={b.id}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '14px 16px', color: '#fff', fontSize: 14, fontWeight: 500 }}>{b.name}</td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'capitalize' }}>{b.category}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <select
                                                    value={b.subscription_plan}
                                                    onChange={e => handleChangePlan(b.id, e.target.value)}
                                                    style={{
                                                        padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'rgba(255,255,255,0.05)', color: '#c4b5fd',
                                                        fontSize: 12, cursor: 'pointer', outline: 'none',
                                                    }}
                                                >
                                                    <option value="free" style={{ background: '#1a1a2e' }}>Free</option>
                                                    <option value="starter" style={{ background: '#1a1a2e' }}>Starter</option>
                                                    <option value="pro" style={{ background: '#1a1a2e' }}>Pro</option>
                                                    <option value="enterprise" style={{ background: '#1a1a2e' }}>Enterprise</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{b.feedbackCount}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', minWidth: 60 }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${Math.min(usagePercent, 100)}%`,
                                                            borderRadius: 3,
                                                            background: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#fbbf24' : '#8b5cf6',
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    </div>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, whiteSpace: 'nowrap' }}>
                                                        {b.monthly_feedback_count}/{b.monthly_feedback_limit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>{b.userCount}</td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                {new Date(b.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <button
                                                    onClick={() => handleDeleteBusiness(b.id, b.name)}
                                                    title="Delete business"
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                                                        background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                                        cursor: 'pointer', fontSize: 12,
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {businesses.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No businesses found</div>
                    )}

                    <Pagination page={businessesPage} totalPages={businessesTotalPages} onPageChange={setBusinessesPage} />
                </div>
            )}

            {/* ══════════════════════════════════ FEEDBACKS ══════════════════════════════════ */}
            {activeTab === 'feedbacks' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        <SearchInput value={feedbacksSearch} onChange={v => { setFeedbacksSearch(v); setFeedbacksPage(1) }} placeholder="Search feedback messages..." />
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['all', 'positive', 'negative'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setFeedbacksType(t); setFeedbacksPage(1) }}
                                    style={{
                                        padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                        background: feedbacksType === t ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                                        color: feedbacksType === t ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                                    }}
                                >
                                    {t === 'all' ? '🔵 All' : t === 'positive' ? '😊 Positive' : '😟 Negative'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {feedbacks.map(f => (
                            <div
                                key={f.id}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: 14,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${f.is_positive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 16,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                {/* Rating Stars */}
                                <div style={{ minWidth: 70, textAlign: 'center' }}>
                                    <div style={{ fontSize: 16, letterSpacing: 2 }}>
                                        {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                                        {f.is_positive ? '😊' : '😟'} {f.ai_sentiment || (f.is_positive ? 'positive' : 'negative')}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>
                                        {f.message || <i style={{ color: 'rgba(255,255,255,0.3)' }}>No message</i>}
                                    </p>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                        <span>🏢 {f.businesses?.name || 'Unknown'}</span>
                                        <span>📅 {new Date(f.created_at).toLocaleString()}</span>
                                        {f.ai_confidence && <span>🤖 {f.ai_confidence}% confidence</span>}
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDeleteFeedback(f.id)}
                                    title="Delete feedback"
                                    style={{
                                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                                        background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                        cursor: 'pointer', fontSize: 12, flexShrink: 0,
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    {feedbacks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No feedbacks found</div>
                    )}

                    <Pagination page={feedbacksPage} totalPages={feedbacksTotalPages} onPageChange={setFeedbacksPage} />
                </div>
            )}

            {/* ══════════════════════════════════ PAYMENTS ══════════════════════════════════ */}
            {activeTab === 'payments' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        <SearchInput value={paymentsSearch} onChange={v => { setPaymentsSearch(v); setPaymentsPage(1) }} placeholder="Search by payment reference..." />
                        
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
                            {['all', 'created', 'paid', 'failed'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setPaymentsStatus(t); setPaymentsPage(1) }}
                                    style={{
                                        padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                                        background: paymentsStatus === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: paymentsStatus === t ? '#fff' : 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{payments.length} shown</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Reference', 'Business', 'User', 'Amount', 'Status', 'Created', 'Paid'].map(h => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr
                                        key={p.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px', color: '#fff', fontSize: 13, fontFamily: 'monospace' }}>
                                            {p.reference_id || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                                            {p.businesses?.name || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                                            {p.users?.email || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#fff', fontSize: 13, fontWeight: 500 }}>
                                            ₹{(p.amount / 100).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                                                background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : p.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                                color: p.status === 'paid' ? '#4ade80' : p.status === 'failed' ? '#f87171' : 'rgba(255,255,255,0.5)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {payments.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No payments found</div>
                    )}

                    <Pagination page={paymentsPage} totalPages={paymentsTotalPages} onPageChange={setPaymentsPage} />
                </div>
            )}

            {/* Animation styles */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Layout>
    )
}
