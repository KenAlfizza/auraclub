export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/src/assets/react.svg'
    return `${API_BASE_URL}/uploads/avatars/${avatarPath}`
}