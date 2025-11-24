import { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from '../services/api'

const UserContext = createContext()

export function UserProvider({ children }) {
    // Private state and Setters
    const [userUtorid, setUserUtorid] = useState(null)
    const [userName, setUserName] = useState(null)
    const [userEmail, setUserEmail] = useState(null)
    const [userBirthday, setUserBirthday] = useState(null)   
    const [userRole, setUserRole] = useState(null)
    const [userPoints, setUserPoints] = useState(null)
    const [userCreatedAt, setUserCreatedAt] = useState(null)
    const [userLastLogin, setUserLastLogin] = useState(null)
    const [userVerified, setUserVerified] = useState(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    // Getters
    const getUserUtorid = userUtorid
    const getUserName = userName
    const getUserEmail = userEmail
    const getUserBirthday = userBirthday
    const getUserRole = userRole
    const getUserPoints = userPoints
    const getUserCreatedAt = userCreatedAt
    const getUserLastLogin = userLastLogin
    const getUserVerified = userVerified

    // Helper function to set all user data
    const setAllUserData = (user) => {
        setUserUtorid(user.utorid)
        setUserName(user.name)
        setUserEmail(user.email)
        setUserBirthday(user.birthday)
        setUserRole(user.role)
        setUserPoints(user.points)
        setUserCreatedAt(user.createdAt)
        setUserLastLogin(user.lastLogin)
        setUserVerified(user.verified)
    }

    // Login
    const login = async (utorid, password) => {
        console.log('Context login called with:', utorid, password)
        setLoading(true)
        setError(null)
        
        try {
            console.log('Calling userAPI.login...')
            const data = await userAPI.login(utorid, password)
            
            console.log('Login response received:', data)
            
            // Store token
            localStorage.setItem('token', data.token)

           // Fetch full user data with the token
            console.log('Fetching user data with token...')
            await fetchCurrentUser()

            return data

        } catch (err) {
                console.error('Login failed in context:', err)
                setError(err.message)
                throw err
        } finally {
                setLoading(false)
                console.log('Login process complete')
        }
    }

    // Fetch current user data with token
    const fetchCurrentUser = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const user = await userAPI.getCurrentUser()
            console.log('Fetched user data:', user)
            setAllUserData(user)
            return user
        } catch (err) {
            console.error('Failed to fetch user:', err)
            setError(err.message)
            // If token is invalid, clear it
            localStorage.removeItem('token')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Check if user is already logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            console.log('Token found, fetching user data...')
            fetchCurrentUser().catch(err => {
                console.log('Auto-login failed:', err)
            })
        }
    }, [])

    // Register a user
    const register = async (utorid, name, email) => {
        console.log('Context register called with:', utorid, name, email)
        setLoading(true)

        try {
            console.log('Callign userAPI.register...')
            const data = await userAPI.register(utorid, name, email);

            console.log('Register response received:', data)

            return data

        } catch (err) {
            console.error('Register failed in context:', err)
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
            console.log('Register process complete')
        }

    }

    // "Public interface"
    const value = {
        loading,
        error,
        
        getUserUtorid,
        getUserName,
        getUserEmail,
        getUserBirthday,
        getUserRole,
        getUserPoints,
        getUserCreatedAt,
        getUserLastLogin,
        getUserVerified,
        
        // Actions
        login,
        register,
        fetchCurrentUser,
    }
    
    // Public interface
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}