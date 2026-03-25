import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import API_URL from '../config/api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts'

// Glass card style helper
const glassCard = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
}

const COLORS = {
    positive: '#22c55e',
    negative: '#ef4444',
    total: '#667eea',
    rating: '#f59e0b',
    neutral: '#eab308',
    purple: '#a855f7',
    teal: '#14b8a6',
    pink: '#ec4899',
    blue: '#3b82f6'
}

const PIE_COLORS = ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6', '#f97316']

export default function Analytics() {
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState(null)
    const [range, setRange] = useState('month')
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [showCustom, setShowCustom] = useState(false)
    const [chartType, setChartType] = useState('area') // 'line', 'bar', 'area'

    useEffect(() => {
        fetchAnalytics()
    }, [range, startDate, endDate])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const token = getToken()
            if (!token || !user?.businessId) {
                setLoading(false)
                return
            }

            let url = `${API_URL}/api/business/${user.businessId}/analytics?range=${range}`
            
            if (range === 'custom' && startDate && endDate) {
                url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setAnalyticsData(data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const rangeOptions = [
        { value: 'week', label: 'Last 7 Days' },
        { value: 'month', label: 'Last 30 Days' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ]

    const handleRangeChange = (value) => {
        setRange(value)
        if (value === 'custom') {
            setShowCustom(true)
            const end = new Date()
            const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
            setStartDate(start)
            setEndDate(end)
        } else {
            setShowCustom(false)
            setStartDate(null)
            setEndDate(null)
        }
    }

    // Pie chart data
    const pieData = analyticsData ? [
        { name: 'Positive', value: analyticsData.summary.positive, color: COLORS.positive },
        { name: 'Negative', value: analyticsData.summary.negative, color: COLORS.negative },
    ] : []

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white'
                }}>
                    <p className="font-medium mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const renderChart = () => {
        if (!analyticsData?.chartData?.length) return null

        const chartProps = {
            data: analyticsData.chartData,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        }

        if (chartType === 'bar') {
            return (
                <BarChart {...chartProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="positive" name="Positive" fill={COLORS.positive} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negative" name="Negative" fill={COLORS.negative} radius={[4, 4, 0, 0]} />
                </BarChart>
            )
        } else if (chartType === 'line') {
            return (
                <LineChart {...chartProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="positive" name="Positive" stroke={COLORS.positive} strokeWidth={2} dot={{ fill: COLORS.positive }} />
                    <Line type="monotone" dataKey="negative" name="Negative" stroke={COLORS.negative} strokeWidth={2} dot={{ fill: COLORS.negative }} />
                    <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.total} strokeWidth={2} dot={{ fill: COLORS.total }} />
                </LineChart>
            )
        } else {
            return (
                <AreaChart {...chartProps}>
                    <defs>
                        <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="positive" name="Positive" stroke={COLORS.positive} fillOpacity={1} fill="url(#positiveGradient)" />
                    <Area type="monotone" dataKey="negative" name="Negative" stroke={COLORS.negative} fillOpacity={1} fill="url(#negativeGradient)" />
                </AreaChart>
            )
        }
    }

    // Heatmap color helper
    const getHeatmapColor = (count, maxCount) => {
        if (count === 0) return 'rgba(255,255,255,0.03)'
        const intensity = Math.min(count / Math.max(maxCount, 1), 1)
        return `rgba(139, 92, 246, ${0.15 + intensity * 0.7})`
    }

    // Max heatmap value
    const maxHeatmapCount = useMemo(() => {
        if (!analyticsData?.hourlyHeatmap) return 1
        return Math.max(...analyticsData.hourlyHeatmap.map(h => h.count), 1)
    }, [analyticsData?.hourlyHeatmap])

    // Heatmap hours to display (condensed)
    const heatmapHours = [0, 3, 6, 9, 12, 15, 18, 21]

    return (
        <Layout>
            <div className="animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 
                            className="text-2xl font-bold"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Analytics
                        </h1>
                        <p className="text-white/60">Track your feedback trends and performance</p>
                    </div>

                    {/* Range Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {rangeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleRangeChange(opt.value)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                                style={range === opt.value ? {
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                    color: '#a5b4fc',
                                    boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
                                } : {
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range */}
                {showCustom && (
                    <div className="p-5 mb-6 rounded-2xl relative z-[100]" style={glassCard}>
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Custom range</p>
                        <div className="flex flex-wrap items-end gap-5">
                            <div className="min-w-[180px]">
                                <label className="block text-sm font-semibold text-white mb-2">From date</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    maxDate={new Date()}
                                    className="analytics-date-input w-full px-4 py-3 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    dateFormat="MMM d, yyyy"
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={5}
                                    popperClassName="analytics-datepicker-popper"
                                    calendarClassName="analytics-datepicker-calendar"
                                    popperPlacement="bottom-start"
                                    popperModifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                                />
                            </div>
                            <div className="min-w-[180px]">
                                <label className="block text-sm font-semibold text-white mb-2">To date</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    maxDate={new Date()}
                                    className="analytics-date-input w-full px-4 py-3 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    dateFormat="MMM d, yyyy"
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={5}
                                    popperClassName="analytics-datepicker-popper"
                                    calendarClassName="analytics-datepicker-calendar"
                                    popperPlacement="bottom-start"
                                    popperModifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                                />
                            </div>
                            <button
                                onClick={fetchAnalytics}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div 
                            className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
                            style={{ borderColor: '#667eea', borderTopColor: 'transparent' }}
                        ></div>
                    </div>
                ) : analyticsData ? (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                            {[
                                { label: 'Total', value: analyticsData.summary.total, color: 'blue', icon: '💬' },
                                { label: 'Positive', value: analyticsData.summary.positive, color: 'green', icon: '👍' },
                                { label: 'Negative', value: analyticsData.summary.negative, color: 'red', icon: '👎' },
                                { label: 'Avg Rating', value: analyticsData.summary.avgRating, suffix: '/5', color: 'yellow', icon: '⭐' },
                                { label: 'Success', value: `${analyticsData.summary.positiveRate}%`, color: 'teal', icon: '📊' },
                                { label: 'NPS Score', value: analyticsData.summary.npsScore ?? '—', color: 'purple', icon: '🎯' },
                                { label: 'Response', value: `${analyticsData.summary.responseRate ?? 0}%`, color: 'pink', icon: '💬' },
                                { label: 'Avg Reply', value: analyticsData.summary.avgResponseTimeHours != null ? `${analyticsData.summary.avgResponseTimeHours}h` : '—', color: 'orange', icon: '⏱️' },
                            ].map((card, i) => (
                                <div key={i} className="p-4 text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]" style={glassCard}>
                                    <span className="text-xl block mb-2">{card.icon}</span>
                                    <p className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{card.value}{card.suffix || ''}</p>
                                    <p className="text-[9px] sm:text-[10px] font-semibold text-white/50 uppercase tracking-widest">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Auto-Generated Insights */}
                        {analyticsData.chartData?.length >= 2 && (
                            <div className="mb-6 p-5 sm:p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.05)]" style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.15)',
                            }}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500"></div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                        Smart Insights
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                    {(() => {
                                        const insights = [];
                                        const { summary, chartData } = analyticsData;
                                        
                                        if (summary.total > 0) {
                                            if (summary.positiveRate >= 80) {
                                                insights.push({ icon: '🏆', title: 'Excellent Sentiment', text: `${summary.positiveRate}% of feedback is positive. Outstanding!`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' });
                                            } else if (summary.positiveRate <= 40) {
                                                insights.push({ icon: '⚠️', title: 'Attention Required', text: `Only ${summary.positiveRate}% positive feedback. Review critical areas.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' });
                                            } else {
                                                insights.push({ icon: '⚖️', title: 'Balanced Feedback', text: `Steady at ${summary.positiveRate}% positive feedback. Strong base to improve.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' });
                                            }
                                        }

                                        const firstPoint = chartData[0];
                                        const lastPoint = chartData[chartData.length - 1];
                                        if (lastPoint.avgRating > firstPoint.avgRating) {
                                            insights.push({ icon: '📈', title: 'Rating Trending Up', text: `Average rating rose from ${firstPoint.avgRating} to ${lastPoint.avgRating}.`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' });
                                        } else if (lastPoint.avgRating < firstPoint.avgRating) {
                                            insights.push({ icon: '📉', title: 'Rating Dipped', text: `Average rating fell from ${firstPoint.avgRating} to ${lastPoint.avgRating}.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' });
                                        } else {
                                            insights.push({ icon: '➡️', title: 'Consistent Ratings', text: `Ratings held remarkably steady at ${firstPoint.avgRating}.`, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' });
                                        }

                                        const maxFeedbackPoint = [...chartData].sort((a, b) => b.total - a.total)[0];
                                        if (maxFeedbackPoint && maxFeedbackPoint.total > 0) {
                                            insights.push({ icon: '🔥', title: 'Peak Engagement', text: `Most feedback (${maxFeedbackPoint.total} reviews) received on ${maxFeedbackPoint.label}.`, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' });
                                        } else {
                                            insights.push({ icon: '🔍', title: 'Awaiting Data', text: `Gather more feedback to see peak engagement trends.`, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' });
                                        }

                                        return insights.map((insight, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl border ${insight.border} ${insight.bg} backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1`}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xl">{insight.icon}</span>
                                                    <h3 className={`font-semibold text-sm sm:text-base ${insight.color}`}>{insight.title}</h3>
                                                </div>
                                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{insight.text}</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Main Chart */}
                        <div className="p-6 mb-6" style={glassCard}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 
                                        className="text-lg font-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Feedback Trend
                                    </h2>
                                    
                                    {/* Chart Type Toggle */}
                                    <div className="flex gap-2">
                                        {[
                                            { type: 'area', label: 'Area' },
                                            { type: 'line', label: 'Line' },
                                            { type: 'bar', label: 'Bar' }
                                        ].map(({ type, label }) => (
                                            <button
                                                key={type}
                                                onClick={() => setChartType(type)}
                                                className="w-8 h-8 rounded-lg text-sm transition-all duration-300"
                                                style={chartType === type ? {
                                                    background: 'rgba(102, 126, 234, 0.4)',
                                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                                } : {
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ height: '300px' }}>
                                    {analyticsData.chartData?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            {renderChart()}
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50">
                                            No data available for this period
                                        </div>
                                    )}
                                </div>
                            </div>

                        {/* Cumulative Growth + Positive Rate Trend */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Cumulative Growth */}
                            <div className="p-6" style={glassCard}>
                                <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Cumulative Growth
                                </h2>
                                <div style={{ height: '250px' }}>
                                    {analyticsData.chartData?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.6}/>
                                                        <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.05}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="cumulative" name="Total Cumulative" stroke={COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#cumulativeGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50">No data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Positive Rate Over Time */}
                            <div className="p-6" style={glassCard}>
                                <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Satisfaction Rate Trend
                                </h2>
                                <div style={{ height: '250px' }}>
                                    {analyticsData.chartData?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analyticsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.6)" fontSize={12} tickFormatter={v => `${v}%`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="positiveRate" name="Satisfaction %" stroke={COLORS.teal} strokeWidth={3} dot={{ fill: COLORS.teal, r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50">No data available</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart & Rating Distribution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Pie Chart */}
                            <div className="p-6" style={glassCard}>
                                    <h2 
                                        className="text-lg font-bold mb-4"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Feedback Distribution
                                    </h2>
                                    <div style={{ height: '250px' }}>
                                        {analyticsData.summary.total > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/50">
                                                No data available
                                            </div>
                                        )}
                                    </div>
                            </div>

                            {/* Average Rating Trend */}
                            <div className="p-6" style={glassCard}>
                                    <h2 
                                        className="text-lg font-bold mb-4"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Average Rating Trend
                                    </h2>
                                    <div style={{ height: '250px' }}>
                                        {analyticsData.chartData?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analyticsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                    <YAxis domain={[0, 5]} stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="avgRating" 
                                                        name="Avg Rating" 
                                                        stroke={COLORS.rating} 
                                                        strokeWidth={3}
                                                        dot={{ fill: COLORS.rating, r: 4 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/50">
                                                No data available
                                            </div>
                                        )}
                                    </div>
                                </div>
                        </div>

                        {/* Rating Distribution Bar + AI Sentiment Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Rating Distribution */}
                            {analyticsData.ratingDistribution && (
                                <div className="p-6" style={glassCard}>
                                    <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        ⭐ Rating Breakdown
                                    </h2>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData.ratingDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" name="Reviews" radius={[8, 8, 0, 0]}>
                                                    {analyticsData.ratingDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={
                                                            entry.star >= 4 ? COLORS.positive :
                                                            entry.star === 3 ? COLORS.neutral :
                                                            COLORS.negative
                                                        } />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                        {analyticsData.ratingDistribution.map(r => (
                                            <span key={r.star} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                                                {r.name}: {r.count} ({r.percentage}%)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Sentiment Breakdown */}
                            {analyticsData.aiSentiment && analyticsData.aiSentiment.totalAnalyzed > 0 && (
                                <div className="p-6" style={glassCard}>
                                    <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        🤖 AI Sentiment Analysis
                                    </h2>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Positive', value: analyticsData.aiSentiment.breakdown.positive },
                                                        { name: 'Negative', value: analyticsData.aiSentiment.breakdown.negative },
                                                        { name: 'Neutral', value: analyticsData.aiSentiment.breakdown.neutral },
                                                        { name: 'Mixed', value: analyticsData.aiSentiment.breakdown.mixed },
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={95}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    <Cell fill={COLORS.positive} />
                                                    <Cell fill={COLORS.negative} />
                                                    <Cell fill={COLORS.neutral} />
                                                    <Cell fill={COLORS.purple} />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-3 flex justify-center gap-4 flex-wrap">
                                        <span className="text-xs text-white/50">
                                            {analyticsData.aiSentiment.totalAnalyzed} analyzed
                                        </span>
                                        {analyticsData.aiSentiment.avgConfidence != null && (
                                            <span className="text-xs text-purple-300">
                                                Avg Confidence: {analyticsData.aiSentiment.avgConfidence}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Fallback if no AI data */}
                            {(!analyticsData.aiSentiment || analyticsData.aiSentiment.totalAnalyzed === 0) && (
                                <div className="p-6 flex flex-col items-center justify-center" style={glassCard}>
                                    <span className="text-4xl mb-3">🤖</span>
                                    <h3 className="text-lg font-bold text-white/80 mb-2">AI Sentiment</h3>
                                    <p className="text-sm text-white/50 text-center">No AI-analyzed feedback yet. Sentiment analysis runs automatically when customers submit feedback.</p>
                                </div>
                            )}
                        </div>

                        {/* Feedback Source + Activity Heatmap */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Source Breakdown */}
                            {analyticsData.sourceBreakdown && analyticsData.sourceBreakdown.length > 0 && (
                                <div className="p-6" style={glassCard}>
                                    <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        📊 Feedback Sources
                                    </h2>
                                    <div className="space-y-3">
                                        {analyticsData.sourceBreakdown.map((source, i) => (
                                            <div key={source.source}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-white/80">{source.name}</span>
                                                    <span className="text-xs text-white/50">{source.count} ({source.percentage}%)</span>
                                                </div>
                                                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${source.percentage}%`,
                                                            background: `linear-gradient(90deg, ${PIE_COLORS[i % PIE_COLORS.length]}, ${PIE_COLORS[i % PIE_COLORS.length]}88)`,
                                                            minWidth: source.count > 0 ? '8px' : '0'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Activity Heatmap */}
                            {analyticsData.hourlyHeatmap && analyticsData.summary.total > 0 && (
                                <div className="p-6" style={glassCard}>
                                    <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        🕐 Activity Heatmap
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full" style={{ minWidth: '320px' }}>
                                            <thead>
                                                <tr>
                                                    <th className="text-[10px] text-white/40 font-normal pr-2 text-left w-10"></th>
                                                    {heatmapHours.map(h => (
                                                        <th key={h} className="text-[10px] text-white/40 font-normal px-0.5 text-center">
                                                            {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                    const dayData = analyticsData.hourlyHeatmap.filter(h => h.day === day)
                                                    return (
                                                        <tr key={day}>
                                                            <td className="text-[10px] text-white/50 pr-2 font-medium">{day}</td>
                                                            {heatmapHours.map(hour => {
                                                                const cell = dayData.find(d => d.hour === hour)
                                                                const count = cell?.count || 0
                                                                return (
                                                                    <td key={hour} className="px-0.5 py-0.5">
                                                                        <div
                                                                            className="w-full rounded-sm transition-all duration-300 hover:scale-125 cursor-default"
                                                                            style={{
                                                                                background: getHeatmapColor(count, maxHeatmapCount),
                                                                                aspectRatio: '1',
                                                                                minHeight: '16px',
                                                                                border: count > 0 ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.03)',
                                                                            }}
                                                                            title={`${day} ${hour}:00 — ${count} feedback${count !== 1 ? 's' : ''}`}
                                                                        />
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-3">
                                        <span className="text-[10px] text-white/40">Less</span>
                                        {[0.03, 0.2, 0.4, 0.6, 0.85].map((op, i) => (
                                            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(139, 92, 246, ${op})` }} />
                                        ))}
                                        <span className="text-[10px] text-white/40">More</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Keywords */}
                        {analyticsData.topKeywords && analyticsData.topKeywords.length > 0 && (
                            <div className="p-6 mb-6" style={glassCard}>
                                <h2 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    🏷️ Top Keywords
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {analyticsData.topKeywords.map((kw, i) => {
                                        const maxCount = analyticsData.topKeywords[0]?.count || 1
                                        const intensity = 0.3 + (kw.count / maxCount) * 0.7
                                        const size = 0.75 + (kw.count / maxCount) * 0.35
                                        return (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 cursor-default"
                                                style={{
                                                    background: `rgba(102, 126, 234, ${intensity * 0.3})`,
                                                    border: `1px solid rgba(102, 126, 234, ${intensity * 0.5})`,
                                                    color: `rgba(165, 180, 252, ${intensity + 0.2})`,
                                                    fontSize: `${size}rem`,
                                                }}
                                                title={`Mentioned ${kw.count} times`}
                                            >
                                                {kw.word} <span className="text-white/30 text-xs">×{kw.count}</span>
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* NPS Gauge + Response Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* NPS Gauge */}
                            <div className="p-6 text-center" style={glassCard}>
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Net Promoter Score</h3>
                                <div className="relative inline-flex items-center justify-center w-36 h-36">
                                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none"
                                            stroke={
                                                (analyticsData.summary.npsScore ?? 0) >= 50 ? COLORS.positive :
                                                (analyticsData.summary.npsScore ?? 0) >= 0 ? COLORS.rating :
                                                COLORS.negative
                                            }
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${Math.max(0, Math.min(100, (analyticsData.summary.npsScore ?? 0) + 100) / 200 * 314)} 314`}
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-bold text-white">{analyticsData.summary.npsScore ?? '—'}</span>
                                </div>
                                <p className="text-xs text-white/50 mt-2">
                                    {(analyticsData.summary.npsScore ?? 0) >= 50 ? 'Excellent' :
                                     (analyticsData.summary.npsScore ?? 0) >= 0 ? 'Good' : 'Needs Work'}
                                </p>
                            </div>

                            {/* Response Rate Gauge */}
                            <div className="p-6 text-center" style={glassCard}>
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Response Rate</h3>
                                <div className="relative inline-flex items-center justify-center w-36 h-36">
                                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none"
                                            stroke={COLORS.blue}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${((analyticsData.summary.responseRate ?? 0) / 100) * 314} 314`}
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-bold text-white">{analyticsData.summary.responseRate ?? 0}%</span>
                                </div>
                                <p className="text-xs text-white/50 mt-2">
                                    {analyticsData.summary.repliedCount ?? 0} of {analyticsData.summary.total} replied
                                </p>
                            </div>

                            {/* Avg Response Time */}
                            <div className="p-6 text-center" style={glassCard}>
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Avg Response Time</h3>
                                <div className="relative inline-flex items-center justify-center w-36 h-36">
                                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none"
                                            stroke={COLORS.pink}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${Math.min(314, analyticsData.summary.avgResponseTimeHours != null ? Math.max(20, (1 - Math.min(analyticsData.summary.avgResponseTimeHours / 48, 1)) * 314) : 0)} 314`}
                                        />
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="text-2xl font-bold text-white">
                                            {analyticsData.summary.avgResponseTimeHours != null
                                                ? (analyticsData.summary.avgResponseTimeHours < 1 ? '<1' : analyticsData.summary.avgResponseTimeHours)
                                                : '—'}
                                        </span>
                                        {analyticsData.summary.avgResponseTimeHours != null && (
                                            <span className="text-sm text-white/50 block">hours</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-white/50 mt-2">
                                    {analyticsData.summary.avgResponseTimeHours != null
                                        ? (analyticsData.summary.avgResponseTimeHours < 24 ? 'Great response time!' : 'Try to respond faster')
                                        : 'No replies yet'}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-white/60">
                        Failed to load analytics data
                    </div>
                )}
            </div>
        </Layout>
    )
}
