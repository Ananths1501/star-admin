"use client"

import { useState, useEffect } from "react"
import { Package, Clock, Check, Truck, X, Calendar, Search, Filter, Phone, User } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, dateRange, customerPhone, customerName, orders])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/orders")
      setOrders(response.data)
      setFilteredOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
          (order._id && order._id.toLowerCase().includes(searchLower)) ||
          (order.customer && order.customer.toLowerCase().includes(searchLower)) ||
          (order.user && order.user.name && order.user.name.toLowerCase().includes(searchLower)),
      )
    }

    // Apply customer phone filter
    if (customerPhone) {
      filtered = filtered.filter(
        (order) => order.customerPhone && order.customerPhone.toLowerCase().includes(customerPhone.toLowerCase()),
      )
    }

    // Apply customer name filter
    if (customerName) {
      filtered = filtered.filter(
        (order) => order.customer && order.customer.toLowerCase().includes(customerName.toLowerCase()),
      )
    }

    // Apply date range filter
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate)
      startDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((order) => new Date(order.createdAt) >= startDate)
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((order) => new Date(order.createdAt) <= endDate)
    }

    setFilteredOrders(filtered)
  }

  const handleViewOrder = (order) => {
    setCurrentOrder(order)
    setShowOrderModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="text-yellow-500" />
      case "Processing":
        return <Package className="text-blue-500" />
      case "Shipped":
        return <Truck className="text-purple-500" />
      case "Delivered":
        return <Check className="text-green-500" />
      case "Cancelled":
        return <X className="text-red-500" />
      default:
        return <Clock className="text-gray-500" />
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-red-600/30 hover:from-blue-600/40 hover:via-purple-600/40 hover:to-red-600/40 border border-white/30 rounded-md text-white transition-all duration-300 flex items-center"
          >
            <Filter size={18} className="mr-1" /> Filter
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Customer Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Search by phone..."
                  className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Customer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 text-center">
          <Package className="mx-auto text-white/40 text-5xl mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">No orders found</h2>
          <p className="text-white/70">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/20">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {order.orderNumber || order._id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {order.user ? order.user.name : order.customer || "Walk-in Customer"}
                      </div>
                      {order.user && <div className="text-xs text-white/70">{order.user.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.customerPhone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">₹{order.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-white/70">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        <span className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-white hover:text-blue-300 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && currentOrder && (
        <OrderDetailsModal order={currentOrder} onClose={() => setShowOrderModal(false)} onStatusUpdate={fetchOrders} />
      )}
    </div>
  )
}

// Update the OrderDetailsModal with gradient background
const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(order.status)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async () => {
    if (status === order.status) {
      return
    }

    setIsLoading(true)

    try {
      await api.put(`/orders/${order._id}/status`, { status })
      toast.success("Order status updated successfully")
      onStatusUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Order Details</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2 text-white">Order Information</h3>
              <p className="text-sm mb-1 text-white">Order ID: {order.orderNumber || order._id}</p>
              <p className="text-sm mb-1 text-white">Date: {formatDate(order.createdAt)}</p>
              <p className="text-sm mb-1 text-white">
                Status:
                <span
                  className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              </p>
              <p className="text-sm mb-1 text-white">Payment Method: {order.paymentMethod || "Cash"}</p>
              <p className="text-sm text-white">Payment Status: {order.paymentStatus || "Paid"}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-white">Customer Information</h3>
              {order.user ? (
                <>
                  <p className="text-sm mb-1 text-white">Name: {order.user.name}</p>
                  <p className="text-sm mb-1 text-white">Email: {order.user.email}</p>
                  <p className="text-sm mb-1 text-white">Phone: {order.user.phone}</p>
                  <p className="text-sm text-white">Address: {order.user.address}</p>
                </>
              ) : (
                <>
                  <p className="text-sm mb-1 text-white">Name: {order.customer || "Walk-in Customer"}</p>
                  <p className="text-sm text-white">Phone: {order.customerPhone || "N/A"}</p>
                </>
              )}
            </div>
          </div>

          <h3 className="font-semibold mb-2 text-white">Order Items</h3>
          <div className="bg-white/5 rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={item.product?.image || "/placeholder.svg?height=40&width=40"}
                          alt={item.product?.name}
                          className="w-10 h-10 object-cover rounded-md mr-3"
                        />
                        <div>
                          <div className="font-medium text-sm text-white">{item.product?.name}</div>
                          <div className="text-xs text-white/70">{item.product?.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">₹{item.price?.toFixed(2)}</div>
                      {item.discount > 0 && <div className="text-xs text-red-300">-{item.discount}%</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">{item.quantity}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        ₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/10">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-medium text-white">
                    Total:
                  </td>
                  <td className="px-4 py-3 font-medium text-white">₹{order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20">
            <div className="w-1/2">
              <label htmlFor="status" className="block text-sm font-medium text-white mb-1">
                Update Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
              >
                <option value="Pending" className="bg-blue-900 text-white">
                  Pending
                </option>
                <option value="Processing" className="bg-blue-900 text-white">
                  Processing
                </option>
                <option value="Shipped" className="bg-blue-900 text-white">
                  Shipped
                </option>
                <option value="Delivered" className="bg-blue-900 text-white">
                  Delivered
                </option>
                <option value="Cancelled" className="bg-blue-900 text-white">
                  Cancelled
                </option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-white/30 rounded-md text-white hover:bg-white/10 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Close
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isLoading || status === order.status}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all hover:-translate-y-1 active:translate-y-0 shadow-md hover:shadow-purple-glow disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
