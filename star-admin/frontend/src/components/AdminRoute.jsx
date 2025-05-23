"use client"

import { Navigate, Outlet, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AdminLayout from "./AdminLayout"

const AdminRoute = () => {
  const { user, loading } = useAuth()
  const { userId } = useParams()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  // Ensure the URL userId matches the logged-in userId
  if (user.userId !== userId) {
    return <Navigate to={`/admin/${user.userId}/dashboard`} replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default AdminRoute
