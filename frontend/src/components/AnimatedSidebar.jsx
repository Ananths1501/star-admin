//AnimatedSidebar.jsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  FileText,
  BarChart,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react"

const AnimatedSidebar = ({ sidebarOpen, setSidebarOpen, handleLogout, user }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState(null)
  const [hoveredItem, setHoveredItem] = useState(null)
  const sidebarRef = useRef(null)

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/products", label: "Products", icon: <Package size={20} /> },
    { path: "/admin/stocks", label: "Stocks", icon: <BarChart size={20} /> },
    { path: "/admin/services", label: "Services", icon: <Wrench size={20} /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { path: "/admin/bill", label: "Billing", icon: <FileText size={20} /> },
  ]

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.path === location.pathname)
    setActiveItem(currentItem?.path || null)
  }, [location.pathname])

  const handleMouseEnter = () => {
    setSidebarOpen(true)
  }

  const handleMouseLeave = () => {
    setSidebarOpen(false)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setTimeout(() => {
      setSidebarOpen(false)
    }, 300)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setSidebarOpen])

  return (
  <div
    ref={sidebarRef}
    className={`fixed top-0 left-0 h-full z-50 bg-glass text-white transition-all duration-300 ease-out transform origin-left ${
      sidebarOpen ? "w-64" : "w-0"
    } overflow-hidden`}
  >
    {/* Mobile sidebar overlay */}
    <div
      className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden ${
        sidebarOpen ? "block" : "hidden"
      }`}
      onClick={() => setSidebarOpen(false)}
    ></div>

    <div className="flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <h1
          className={`text-xl font-bold transition-all duration-300 ${
            sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          }`}
        >
          Star Electricals
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-md md:hidden text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`flex items-center w-full px-4 py-3 rounded-lg relative overflow-hidden group transition-all duration-300 ${
                location.pathname === item.path ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="relative z-10 flex items-center w-full">
                <div className="transition-all duration-300">{item.icon}</div>
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                    sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                  }`}
                >
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <ChevronRight className="ml-auto h-4 w-4 text-white" />
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-white/20">
        <div className="flex items-center mb-4 px-4 py-2 rounded-lg bg-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            {user?.name?.charAt(0) || "A"}
          </div>
          {sidebarOpen && (
            <div className="ml-3 transition-all duration-300">
              <p className="text-sm font-medium text-white">{user?.name || "Admin User"}</p>
              <p className="text-xs text-white/70">{user?.role || "Administrator"}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
        >
          <LogOut size={20} />
          <span
            className={`ml-3 transition-all duration-300 ${
              sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  </div>
)
}

export default AnimatedSidebar