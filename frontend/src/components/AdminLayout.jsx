

"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "./ThemeProvider"
import { toast } from "react-hot-toast"
import { Menu, Bell, Search, User } from "lucide-react"
import AnimatedSidebar from "./AnimatedSidebar"
import { ThemeToggle } from "./ThemeToggle"

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState("Dashboard")
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", time: "5 min ago" },
    { id: 2, message: "Low stock alert: LED Bulbs", time: "1 hour ago" },
    { id: 3, message: "Payment received from John Doe", time: "3 hours ago" },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Set page title based on current location
    const path = location.pathname.split("/").pop()
    const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1)
    setPageTitle(formattedTitle)
  }, [location])

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/admin/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Animated Sidebar */}
      <AnimatedSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        user={user}
        theme={theme}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-glass z-10 transition-all duration-300">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {/* Hamburger Icon */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)} // Toggle sidebar visibility
                className="p-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <Menu size={20} className="text-white" />
              </button>

              {/* Page Title */}
              <h1 className="ml-4 text-xl font-semibold text-white hidden sm:block">{pageTitle}</h1>
            </div>

            <div className="relative mx-auto max-w-md w-full px-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} className="text-white" />
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary-pink text-white text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border-b border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center">
                      <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="font-medium text-white hidden md:block">{user?.adminId || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout