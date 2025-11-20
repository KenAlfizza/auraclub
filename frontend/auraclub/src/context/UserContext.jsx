import { createContext, useContext, useState } from "react";

const UserContext = createContext()

export function UserProvider({ children }) {
    // Private state and Setters

    const [userUtorid, setUserUtorid] = useState(null)
    const [userName, setUserName] = useState(null)
    const [userEmail, setUserEmail] = useState(null)
    const [userBirthday, setUserBirthday] = useState(null)   
    const [userRole, setUserType] = useState(null)
    const [userPoints, setUserPoints] = useState(null)
    const [userCreatedAt, setUserCreatedAt] = useState(null)
    const [userLastLogin, setUserLastLogin] = useState(null)
    const [userVerified, setUserVerified] = useState(null)



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


    // "Public interface"
    const value = {
        getUserUtorid,
        getUserName,
        getUserEmail,
        getUserBirthday,
        getUserRole,
        getUserPoints,
        getUserCreatedAt,
        getUserLastLogin,
        getUserVerified,
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