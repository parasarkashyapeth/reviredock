import { createContext, useState, useEffect, useCallback } from 'react'

// Use environment variable for production, empty string for development (Vite proxy)
const API_URL = import.meta.env.VITE_API_URL || ''
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount: Check for existing session
    useEffect(() => {
        // First, clear any old localStorage data from SQLite era
        localStorage.clear()

        // Check sessionStorage for current session token
        const token = sessionStorage.getItem('token')
        if (token) {
            fetchUserInfo(token)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Invalid session - clear and redirect
                console.log('Session invalid, clearing...')
                sessionStorage.clear()
                setUser(null)
            }
        } catch (error) {
            console.error('Auth error:', error)
            sessionStorage.clear()
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        let response
        try {
            response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
        } catch (networkError) {
            throw new Error('Unable to connect to server. Please check your internet connection.')
        }

        let data
        try {
            data = await response.json()
        } catch {
            throw new Error('Server returned an invalid response. Please try again later.')
        }

        if (!response.ok) {
            throw new Error(data.error || 'Login failed')
        }

        // Store token in sessionStorage (not localStorage)
        sessionStorage.setItem('token', data.token)
        setUser(data.user)
        return data
    }

    const signup = async (userData) => {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed')
        }

        // Store token in sessionStorage (not localStorage)
        sessionStorage.setItem('token', data.token)
        setUser(data.user)
        return data
    }

    const logout = useCallback(() => {
        sessionStorage.clear()
        localStorage.clear() // Also clear any old data
        setUser(null)
    }, [])

    const getToken = () => sessionStorage.getItem('token')

    const getApiUrl = () => API_URL

    const updateUser = (updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : null)
    }

    // Google Sign-In using native Google Identity Services
    // Sends the Google ID token to our backend for verification
    const googleAuth = async (credential) => {
        const response = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Google authentication failed')
        }

        // If user needs to complete signup, return the data for the signup form
        if (data.needsSignup) {
            return { needsSignup: true, googleData: data }
        }

        // Existing user — store token and set user
        sessionStorage.setItem('token', data.token)
        setUser(data.user)
        return data
    }

    // Helper to remove the fallback Google sign-in overlay
    const removeFallbackOverlay = () => {
        const el = document.getElementById('google-signin-fallback')
        if (el) el.remove()
    }

    // Initialize Google One Tap / GIS and return a promise that resolves with the credential
    const signInWithGoogle = () => {
        // Always clean up any leftover overlay from a previous attempt
        removeFallbackOverlay()

        return new Promise((resolve, reject) => {
            if (!GOOGLE_CLIENT_ID) {
                reject(new Error('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.'))
                return
            }

            if (!window.google?.accounts?.id) {
                reject(new Error('Google Identity Services not loaded. Please refresh the page.'))
                return
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    try {
                        // Clean up the overlay BEFORE resolving
                        removeFallbackOverlay()
                        const result = await googleAuth(response.credential)
                        resolve(result)
                    } catch (err) {
                        removeFallbackOverlay()
                        reject(err)
                    }
                },
            })

            // Use the popup flow
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback: render a Google Sign-In button in a temporary container
                    const overlay = document.createElement('div')
                    overlay.style.position = 'fixed'
                    overlay.style.top = '0'
                    overlay.style.left = '0'
                    overlay.style.width = '100%'
                    overlay.style.height = '100%'
                    overlay.style.zIndex = '99999'
                    overlay.style.background = 'rgba(0,0,0,0.6)'
                    overlay.style.display = 'flex'
                    overlay.style.alignItems = 'center'
                    overlay.style.justifyContent = 'center'
                    overlay.id = 'google-signin-fallback'

                    // Click on backdrop to dismiss
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            removeFallbackOverlay()
                        }
                    })

                    // Inner card
                    const card = document.createElement('div')
                    card.style.background = 'rgba(20, 20, 30, 0.95)'
                    card.style.padding = '32px'
                    card.style.borderRadius = '16px'
                    card.style.border = '1px solid rgba(255,255,255,0.1)'
                    card.style.position = 'relative'
                    card.style.minWidth = '320px'
                    card.style.textAlign = 'center'

                    // Close button
                    const closeBtn = document.createElement('button')
                    closeBtn.textContent = '✕'
                    closeBtn.style.position = 'absolute'
                    closeBtn.style.top = '8px'
                    closeBtn.style.right = '12px'
                    closeBtn.style.background = 'none'
                    closeBtn.style.border = 'none'
                    closeBtn.style.color = 'rgba(255,255,255,0.5)'
                    closeBtn.style.fontSize = '18px'
                    closeBtn.style.cursor = 'pointer'
                    closeBtn.addEventListener('click', removeFallbackOverlay)
                    card.appendChild(closeBtn)

                    // Button container
                    const btnContainer = document.createElement('div')
                    btnContainer.style.marginTop = '8px'
                    card.appendChild(btnContainer)

                    overlay.appendChild(card)
                    document.body.appendChild(overlay)

                    window.google.accounts.id.renderButton(btnContainer, {
                        theme: 'filled_black',
                        size: 'large',
                        width: 300,
                        text: 'continue_with',
                    })

                    // Auto-remove after 30s if user doesn't click
                    setTimeout(removeFallbackOverlay, 30000)
                }
            })
        })
    }

    const value = {
        user,
        loading,
        login,
        signup,
        googleAuth,
        signInWithGoogle,
        logout,
        getToken,
        getApiUrl,
        updateUser
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
