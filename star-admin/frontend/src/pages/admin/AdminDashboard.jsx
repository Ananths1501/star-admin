"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Package,
  ShoppingCart,
  Users,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    counts: {
      products: 0,
      orders: 0,
      users: 0,
      services: 0,
      workers: 0,
      admins: 0,
    },
    lowStockProducts: [],
    recentOrders: [],
    salesData: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeframe, setTimeframe] = useState("weekly")
  const [error, setError] = useState(null)

  // Update the useEffect to fetch real data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all required data in parallel
      const [productsRes, ordersRes, servicesRes, statsRes] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
        api.get("/services"),
        api.get("/orders/stats/summary"),
      ])

      // Calculate low stock products
      const lowStockProducts = productsRes.data.filter((product) => product.stock <= product.minStock)

      // Get recent orders
      const recentOrders = ordersRes.data.slice(0, 5)

      // Calculate worker count
      let workerCount = 0
      servicesRes.data.forEach((service) => {
        workerCount += service.workers.length
      })

      // Set dashboard data
      setDashboardData({
        counts: {
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          services: servicesRes.data.length,
          workers: workerCount,
          admins: 1, // Default value
        },
        lowStockProducts: lowStockProducts,
        recentOrders: recentOrders,
        salesData: statsRes.data.salesByDate || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try refreshing.")
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/80">Welcome to Star Electricals Admin Portal</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-glass rounded-md text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
        >
          {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={dashboardData.counts.products}
          icon={<Package className="text-white" />}
          linkTo="/admin/products"
          className="animate-slide-up delay-100"
          trend="+5% from last week"
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={dashboardData.counts.orders}
          icon={<ShoppingCart className="text-white" />}
          linkTo="/admin/orders"
          className="animate-slide-up delay-200"
          trend="+12% from last week"
          trendUp={true}
        />
        <StatCard
          title="Total Services"
          value={dashboardData.counts.services}
          icon={<Wrench className="text-white" />}
          linkTo="/admin/services"
          className="animate-slide-up delay-300"
          trend="+3% from last week"
          trendUp={true}
        />
        <StatCard
          title="Total Workers"
          value={dashboardData.counts.workers}
          icon={<Users className="text-white" />}
          className="animate-slide-up delay-400"
          trend="No change"
          trendUp={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="card-glass p-6 animate-slide-up delay-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-white/80" />
              Low Stock Products
            </h2>
            <Link
              to="/admin/stocks"
              className="text-white/80 hover:text-white text-sm flex items-center transition-colors"
            >
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {dashboardData.lowStockProducts && dashboardData.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/60">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p>No products with low stock</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Min Stock
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {dashboardData.lowStockProducts &&
                    dashboardData.lowStockProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.image || "/placeholder.svg?height=40&width=40"}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded-md mr-2"
                            />
                            <div>
                              <div className="font-medium text-white">{product.name}</div>
                              <div className="text-xs text-white/60">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-white/80">{product.stock}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-white/80">{product.minStock}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/30 text-white">
                            <AlertTriangle className="mr-1 h-4 w-4" /> Low Stock
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card-glass p-6 animate-slide-up delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-white/80" />
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-white/80 hover:text-white text-sm flex items-center transition-colors"
            >
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {dashboardData.recentOrders && dashboardData.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/60">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {dashboardData.recentOrders &&
                    dashboardData.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {order.orderNumber || order._id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-sm text-white/80">
                            {order.user ? order.user.name : order.customer || "Walk-in Customer"}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            ₹{order.totalAmount?.toFixed(2) || "0.00"}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "Pending"
                                ? "bg-yellow-500/30 text-white"
                                : order.status === "Processing"
                                  ? "bg-blue-500/30 text-white"
                                  : order.status === "Shipped"
                                    ? "bg-purple-500/30 text-white"
                                    : order.status === "Delivered"
                                      ? "bg-green-500/30 text-white"
                                      : "bg-red-500/30 text-white"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sales Overview Chart */}
      <div className="mt-6 animate-slide-up delay-400">
        <div className="card-glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-white/80" />
              Sales Overview
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeframe === "weekly"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeframe === "monthly"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          {dashboardData.salesData && dashboardData.salesData.length > 0 ? (
            <div className="h-64">
              {/* Chart would go here - simplified for this example */}
              <div className="grid grid-cols-7 h-full gap-2 items-end">
                {dashboardData.salesData.slice(-7).map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-gradient-primary w-full rounded-t-md transition-all duration-500 hover:shadow-lg hover:scale-105"
                      style={{
                        height: `${Math.max(20, (item.sales / Math.max(...dashboardData.salesData.map((d) => d.sales || 0))) * 100)}%`,
                      }}
                    ></div>
                    <div className="text-xs mt-2 text-white/80">
                      {new Date(item.date).toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <BarChart3 size={64} className="text-white/30" />
              <p className="ml-4 text-white/60">No sales data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon, linkTo, className, trend, trendUp }) => {
  return (
    <div className={`card-glass p-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-white/80">{title}</p>
          <p className="text-2xl font-bold mt-1 text-white">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 flex items-center ${
                trendUp === true ? "text-green-400" : trendUp === false ? "text-red-400" : "text-white/60"
              }`}
            >
              {trendUp === true && <TrendingUp className="h-3 w-3 mr-1" />}
              {trendUp === false && <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />}
              {trend}
            </p>
          )}
        </div>
        <div className="text-3xl bg-white/10 p-3 rounded-lg">{icon}</div>
      </div>
      {linkTo && (
        <div className="mt-4">
          <Link to={linkTo} className="text-sm text-white/80 hover:text-white transition-colors flex items-center">
            View Details <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
