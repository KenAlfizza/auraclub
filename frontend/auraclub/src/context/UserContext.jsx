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
    const getUserRole = userRole
    const getUserPoint = userPoints

    

    // "Public interface"
    const value = {
        getUserRole,
        getUserPoint,
    }

    // Public interface
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}