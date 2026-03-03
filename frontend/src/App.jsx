import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, Component } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

// Error Boundary — prevents white screen on lazy-load failures or render errors
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('App ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'rgba(30, 30, 40, 0.95)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxWidth: '420px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Something went wrong</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                            The page failed to load. This could be a network issue.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.reload()
                            }}
                            style={{
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Loading spinner component
function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="relative">
                {/* Outer ring */}
                <div
                    className="w-16 h-16 rounded-full animate-spin"
                    style={{
                        border: '3px solid rgba(102, 126, 234, 0.2)',
                        borderTopColor: '#667eea',
                    }}
                />
                {/* Inner pulse */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div
                        className="w-8 h-8 rounded-full animate-pulse"
                        style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

// Lazy load heavy pages
const Welcome = lazy(() => import('./pages/Welcome'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const QRCode = lazy(() => import('./pages/QRCode'))
const Settings = lazy(() => import('./pages/Settings'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Feedback = lazy(() => import('./pages/Feedback'))
const Analytics = lazy(() => import('./pages/Analytics'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'))

// Regular imports for lighter pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileSetup from './pages/ProfileSetup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ThankYou from './pages/ThankYou'
import AuthCallback from './pages/AuthCallback'

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

// Public Route wrapper (redirect if logged in)
function PublicRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        )
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Feedback Routes */}
            <Route path="/b/:businessId" element={<Feedback />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Auth Routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/signup" element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />
            <Route path="/forgot-password" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />
            <Route path="/reset-password" element={
                <PublicRoute>
                    <ResetPassword />
                </PublicRoute>
            } />

            {/* Profile Setup (Step 2 of signup) */}
            <Route path="/profile-setup" element={
                <ProtectedRoute>
                    <ProfileSetup />
                </ProtectedRoute>
            } />

            {/* Protected Dashboard Routes */}
            <Route path="/welcome" element={
                <ProtectedRoute>
                    <Welcome />
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/qr-code" element={
                <ProtectedRoute>
                    <QRCode />
                </ProtectedRoute>
            } />
            <Route path="/qr" element={
                <ProtectedRoute>
                    <QRCode />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />
            <Route path="/pricing" element={
                <ProtectedRoute>
                    <Pricing />
                </ProtectedRoute>
            } />
            <Route path="/payment/callback" element={
                <ProtectedRoute>
                    <PaymentCallback />
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <Analytics />
                </ProtectedRoute>
            } />
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminPanel />
                </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                        <AppRoutes />
                    </Suspense>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App
