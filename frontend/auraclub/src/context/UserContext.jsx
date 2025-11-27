import { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from '../api/user-api'

const UserContext = createContext()

export function UserProvider({ children }) {
    // Single user object state (logged-in user)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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

    
    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        setError(null)
    }

    // Fetch current user data with token
    const fetchCurrentUser = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const userData = await userAPI.getCurrentUser()
            console.log('Fetched current user data:', userData)
            setUser(userData)
            return userData
        } catch (err) {
            console.error('Failed to fetch current user:', err)
            setError(err.message)
            // If token is invalid, clear it
            localStorage.removeItem('token')
            setUser(null)
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
        setError(null)

        try {
            console.log('Calling userAPI.register...')
            const data = await userAPI.register(utorid, name, email)

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

    // Function to fetch all users
    const fetchUsers = async (query = {}) => {
        setLoading(true)
        setError(null)
        try {
            // Sanitize query: remove null, undefined, "null", "undefined", and ""
            const sanitizedQuery = Object.fromEntries(
                Object.entries(query).filter(([_, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "null" &&
                    value !== "undefined"
                )
            );
            const data = await userAPI.getAll(sanitizedQuery);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch users")
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Function to fetch a single user by ID
    const fetchUser = async (id) => {
        setLoading(true)
        setError(null)
        try {
            const data = await userAPI.get(id)
            console.log("Fetched user by ID:", data)
            return data
        } catch (err) {
            console.error("Failed to fetch user:", err)
            setError(err.message || "Failed to load user")
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Funcion to patch the user
    const patchUser = async (id, data) => {
        setLoading(true);
        setError(null);

        try {
            const sanitizedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "null" &&
                    value !== "undefined"
                )
            );
            const response = await userAPI.patch(id, sanitizedData);
            return response;
        } catch (err) {
            setError(err.message || "Failed to patch user");
            throw err
        } finally {
            setLoading(false);
        }
    };

    // Public interface
    const value = {
        user,
        loading,
        error,
        
        // Actions
        login,
        logout,
        register,
        fetchCurrentUser,
        fetchUsers,
        fetchUser,
        patchUser,
    }
    
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