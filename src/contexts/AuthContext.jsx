"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on app load
  useEffect(() => {
    const savedAuth = localStorage.getItem("voterAppAuth")
    const savedUser = localStorage.getItem("voterAppUser")

    if (savedAuth === "true" && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setIsAuthenticated(true)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        // Clear invalid data
        localStorage.removeItem("voterAppAuth")
        localStorage.removeItem("voterAppUser")
      }
    }
    setLoading(false)
  }, [])

  const login = async (userData) => {
    try {
      // userData should contain: { adminId, username, email, role }
      const userToStore = {
        id: userData.adminId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        loginTime: new Date().toISOString()
      }

      setIsAuthenticated(true)
      setUser(userToStore)

      // Persist authentication
      localStorage.setItem("voterAppAuth", "true")
      localStorage.setItem("voterAppUser", JSON.stringify(userToStore))

      return { success: true, user: userToStore }
    } catch (error) {
      console.error("Login error in AuthContext:", error)
      return { success: false, error: "Failed to authenticate user" }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    
    // Clear all related localStorage items
    localStorage.removeItem("voterAppAuth")
    localStorage.removeItem("voterAppUser")
    localStorage.removeItem("rememberAdmin")
    localStorage.removeItem("adminIdentifier")
  }

  // Function to update user data (useful for profile updates)
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem("voterAppUser", JSON.stringify(updatedUser))
  }

  // Function to check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role
  }

  // Function to get user ID
  const getUserId = () => {
    return user ? user.id : null
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    hasRole,
    getUserId,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
