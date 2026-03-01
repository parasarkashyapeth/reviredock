import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * AuthCallback handles OAuth redirects.
 * With native Google Identity Services, the flow is handled inline
 * (popup/One Tap), so this page is mainly a fallback/legacy handler.
 * It redirects authenticated users to dashboard or unauthenticated to login.
 */
export default function AuthCallback() {
    const [status, setStatus] = useState('Processing sign-in...')
    const navigate = useNavigate()
    const { user } = useAuth()

    // Watch for user state change and redirect when authenticated
    useEffect(() => {
        if (user) {
            setStatus('Welcome back! Redirecting to dashboard...')
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 500)
        } else {
            // No active session — redirect to login after a brief delay
            const timer = setTimeout(() => {
                setStatus('No active session. Redirecting to login...')
                setTimeout(() => navigate('/login'), 1000)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [user, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <div
                    className="w-16 h-16 rounded-full animate-spin mx-auto mb-6"
                    style={{
                        border: '3px solid rgba(102, 126, 234, 0.2)',
                        borderTopColor: '#667eea',
                    }}
                />
                <p className="text-white/70 text-lg">{status}</p>
            </div>
        </div>
    )
}
