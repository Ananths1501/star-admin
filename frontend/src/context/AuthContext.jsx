"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../utils/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const adminId = localStorage.getItem("adminId")

    if (token && adminId) {
      setUser({ adminId })
      // Optionally verify token with backend
      verifyToken(token, adminId)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token, adminId) => {
    try {
      await api.get("/auth/admin/profile")
      setUser({ adminId })
    } catch (error) {
      console.error("Token verification failed:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (adminId, password) => {
    try {
      // For development purposes, allow login with hardcoded credentials
      if (adminId === "admin" && password === "Admin@123") {
        // Store token and adminId in localStorage
        localStorage.setItem("token", "dev-token")
        localStorage.setItem("adminId", adminId)

        // Set user state
        setUser({ adminId, role: "superadmin" })
        return adminId
      }

      // If not using hardcoded credentials, try the API
      const response = await api.post("/auth/admin/login", { adminId, password })
      const { token, admin } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("adminId", admin.adminId)

      setUser({ adminId: admin.adminId, role: admin.role })
      return admin.adminId
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("adminId")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
