import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Threads from '../components/Threads'
import API_URL from '../config/api'

// Inject glass animations
const GLASS_KEYFRAMES_ID = 'glass-auth-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(GLASS_KEYFRAMES_ID)) {
    const style = document.createElement('style');
    style.id = GLASS_KEYFRAMES_ID;
    style.textContent = `
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glassShine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes borderGlow {
            0%, 100% { border-color: rgba(255, 255, 255, 0.1); }
            50% { border-color: rgba(255, 255, 255, 0.25); }
        }
    `;
    document.head.appendChild(style);
}

const BUSINESS_CATEGORIES = [
    'Restaurant',
    'Café',
    'Gym',
    'Clinic',
    'Salon',
    'Spa',
    'Hotel',
    'Retail Store',
    'Other'
]

export default function ProfileSetup() {
    const [formData, setFormData] = useState({
        ownerName: '',
        businessName: '',
        category: '',
        customCategory: '',
        logoUrl: '',
    })

    const [profileImage, setProfileImage] = useState(null)
    const [profileImagePreview, setProfileImagePreview] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const fileInputRef = useRef(null)

    const { user, getToken, getApiUrl, updateUser } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result)
                setProfileImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.businessName.trim()) {
            setError('Business name is required')
            return
        }

        if (!formData.category) {
            setError('Please select a business category')
            return
        }

        if (formData.category === 'Other' && !formData.customCategory.trim()) {
            setError('Please specify your business type')
            return
        }

        setLoading(true)

        try {
            const token = getToken()
            const finalCategory = formData.category === 'Other'
                ? formData.customCategory.trim()
                : formData.category

            // Update business profile
            const response = await fetch(`${API_URL}/api/business/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    category: finalCategory,
                    logoUrl: formData.logoUrl || null,
                    ownerName: formData.ownerName || null,
                })
            })

            let data
            try {
                data = await response.json()
            } catch {
                throw new Error('Server returned an invalid response')
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile')
            }

            // Update local user context
            updateUser({
                businessName: formData.businessName,
                ownerName: formData.ownerName || null,
            })

            // Upload profile picture if selected
            if (profileImage) {
                setUploadingImage(true)
                try {
                    const apiUrl = getApiUrl()
                    const uploadResponse = await fetch(`${apiUrl}/api/upload/avatar`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            imageData: profileImage
                        })
                    })

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json()
                        updateUser({ profilePictureUrl: uploadData.url })
                    }
                } catch (uploadError) {
                    console.error('Upload error:', uploadError)
                } finally {
                    setUploadingImage(false)
                }
            }

            navigate('/welcome')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-black">
            {/* Animated Threads Background */}
            <div className="absolute inset-0 z-0">
                <Threads
                    amplitude={1}
                    distance={0}
                    enableMouseInteraction
                    color={[0.4, 0.3, 0.9]}
                />
            </div>

            {/* Glass Card Container */}
            <div
                className="w-full max-w-md relative z-10"
                style={{
                    animation: 'fadeInUp 0.8s ease-out',
                }}
            >
                {/* Glow Effect Behind Card */}
                <div
                    className="absolute inset-0 -z-10 blur-3xl opacity-50"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.2) 50%, transparent 70%)',
                        transform: 'scale(1.2)',
                    }}
                />

                {/* Glass Card */}
                <div
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        animation: 'borderGlow 4s ease-in-out infinite',
                    }}
                >
                    {/* Shine Effect */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'glassShine 8s ease-in-out infinite',
                        }}
                    />

                    {/* Header */}
                    <div className="text-center mb-6 relative">
                        {/* Step indicator */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: 'rgba(34, 197, 94, 0.3)',
                                    border: '1px solid rgba(34, 197, 94, 0.5)',
                                    color: '#86efac',
                                }}
                            >✓</div>
                            <div className="w-8 h-px bg-white/30" />
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.5)',
                                    color: '#a5b4fc',
                                }}
                            >2</div>
                        </div>

                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Set Up Your Profile
                        </h1>
                        <p className="text-white/60">Tell us about your business</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative">
                        {/* Profile Picture Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden relative"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                {profileImagePreview ? (
                                    <img
                                        src={profileImagePreview}
                                        alt="Profile preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-3xl">📷</span>
                                        <p className="text-xs text-white/50 mt-1">Add Photo</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={loading}
                            />
                            <p className="text-xs text-white/40 mt-2">Click to upload profile picture</p>
                        </div>

                        {/* Owner Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                placeholder="John Doe"
                                disabled={loading}
                            />
                        </div>

                        {/* Business Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                placeholder="Your Business Name"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Business Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                required
                                disabled={loading}
                            >
                                <option value="" className="bg-gray-900 text-white">Select a category</option>
                                {BUSINESS_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Category */}
                        {formData.category === 'Other' && (
                            <div className="mb-4" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Specify Your Business Type *
                                </label>
                                <input
                                    type="text"
                                    name="customCategory"
                                    value={formData.customCategory}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                    placeholder="e.g., Bakery, Pet Shop, Laundry..."
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Logo URL (Optional) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Logo URL (optional)
                            </label>
                            <input
                                type="url"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                placeholder="https://example.com/your-logo.png"
                                disabled={loading}
                            />
                            <p className="text-xs text-white/40 mt-1">
                                Link to your business logo image (shows on feedback page)
                            </p>
                        </div>

                        {error && (
                            <div
                                className="mb-4 p-3 rounded-xl text-sm text-center"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#fca5a5',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.5)',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {/* Button Shine */}
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    animation: 'glassShine 2s ease-in-out infinite',
                                }}
                            />
                            <span className="relative z-10">
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                                        {uploadingImage ? 'Uploading photo...' : 'Setting up...'}
                                    </span>
                                ) : (
                                    'Complete Setup'
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
