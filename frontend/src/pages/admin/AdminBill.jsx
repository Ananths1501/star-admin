"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Printer, AlertCircle, X } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"
import jsPDF from "jspdf"
import "jspdf-autotable"

const AdminBill = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [billItems, setBillItems] = useState([])
  const [customerName, setCustomerName] = useState("Walk-in Customer")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState(null)
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [billData, setBillData] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get("/products")
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again.")
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const addToBill = (product) => {
    // Check if product has enough stock
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`)
      return
    }

    const existingItem = billItems.find((item) => item._id === product._id)
    if (existingItem) {
      // Check if adding another would exceed stock
      if (existingItem.quantity >= product.stock) {
        toast.error(`Cannot add more ${product.name}. Only ${product.stock} in stock.`)
        return
      }

      setBillItems(
        billItems.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
      toast.success(`Added another ${product.name} to bill`)
    } else {
      setBillItems([...billItems, { ...product, quantity: 1 }])
      toast.success(`Added ${product.name} to bill`)
    }
  }

  const updateQuantity = (id, quantity) => {
    const product = products.find((p) => p._id === id)

    if (quantity > product.stock) {
      toast.error(`Cannot add ${quantity} items. Only ${product.stock} in stock.`)
      return
    }

    if (quantity <= 0) {
      setBillItems(billItems.filter((item) => item._id !== id))
      toast.info("Item removed from bill")
    } else {
      setBillItems(billItems.map((item) => (item._id === id ? { ...item, quantity: Number(quantity) } : item)))
    }
  }

  const calculateItemTotal = (item) => {
    const discountedPrice = item.price * (1 - item.discount / 100)
    return discountedPrice * item.quantity
  }

  const calculateTotal = () => {
    return billItems.reduce((total, item) => {
      return total + calculateItemTotal(item)
    }, 0)
  }

  const handlePrint = async () => {
    if (billItems.length === 0) {
      toast.error("Please add items to the bill")
      return
    }

    // Prepare items for API
    const orderItems = billItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
    }))

    // Create bill data for preview
    const billPreviewData = {
      items: billItems,
      totalAmount: calculateTotal(),
      customer: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      paymentMethod: paymentMethod || "Cash",
      orderNumber: `BILL-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}-${Date.now().toString().substring(8)}`,
      date: new Date().toLocaleDateString(),
    }

    setBillData(billPreviewData)
    setShowBillPreview(true)
  }

  const handleConfirmBill = async () => {
    setIsPrinting(true)
    setError(null)

    try {
      // Prepare items for API
      const orderItems = billItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      }))

      // Create the order for inventory tracking
      const orderResponse = await api.post("/orders/bill", {
        items: orderItems,
        customer: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        paymentMethod: paymentMethod || "Cash",
        orderType: "In-Shop",
      })

      // Create PDF
      const doc = new jsPDF()

      // Add shop details
      doc.setFontSize(20)
      doc.text("Star Electricals", 105, 20, { align: "center" })

      doc.setFontSize(12)
      doc.text("123 Electrical Street, Tech City", 105, 30, { align: "center" })
      doc.text("Phone: +1 234 567 8900", 105, 35, { align: "center" })

      // Add bill details
      doc.setFontSize(14)
      doc.text("BILL / INVOICE", 105, 45, { align: "center" })

      const currentDate = new Date()
      const formattedDate = currentDate.toLocaleDateString()
      const billNumber = orderResponse.data.order.orderNumber

      doc.setFontSize(10)
      doc.text(`Date: ${formattedDate}`, 15, 55)
      doc.text(`Customer: ${customerName}`, 15, 60)
      doc.text(`Phone: ${customerPhone || "N/A"}`, 15, 65)
      doc.text(`Bill No: ${billNumber}`, 15, 70)
      doc.text(`Payment Method: ${paymentMethod}`, 15, 75)

      // Add items table
      const tableColumn = ["Item", "Brand", "Price", "Discount", "Qty", "Total"]
      const tableRows = billItems.map((item) => {
        const discountedPrice = item.price * (1 - item.discount / 100)
        return [
          item.name,
          item.brand,
          `₹${item.price.toFixed(2)}`,
          `${item.discount}%`,
          item.quantity,
          `₹${(discountedPrice * item.quantity).toFixed(2)}`,
        ]
      })

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 138] }, // Dark blue from gradient
      })

      // Add total
      const finalY = doc.lastAutoTable.finalY || 80
      doc.text(`Total Amount: ₹${calculateTotal().toFixed(2)}`, 150, finalY + 10, { align: "right" })

      // Add footer
      doc.setFontSize(8)
      doc.text("Thank you for your business!", 105, finalY + 20, { align: "center" })

      // Save PDF
      doc.save(`Star_Electricals_Bill_${billNumber}.pdf`)

      toast.success("Bill created and saved successfully")

      // Clear bill items
      setBillItems([])
      setCustomerName("Walk-in Customer")
      setCustomerPhone("")
      setPaymentMethod("Cash")
      setShowBillPreview(false)

      // Refresh products to get updated stock
      fetchProducts()
    } catch (error) {
      console.error("Error creating bill:", error)
      setError("Failed to create bill. Please check if all items are in stock and try again.")
      toast.error(`Failed to create bill: ${error.response?.data?.message || "Server error"}`)
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Create Bill</h1>

      {error && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side - Products */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
              <input
                type="text"
                placeholder="Search products by name, brand, or type..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Customer Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
              >
                <option value="Cash" className="bg-blue-900 text-white">
                  Cash
                </option>
                <option value="Card" className="bg-blue-900 text-white">
                  Card
                </option>
                <option value="UPI" className="bg-blue-900 text-white">
                  UPI
                </option>
                <option value="Other" className="bg-blue-900 text-white">
                  Other
                </option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-white/70">No products found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-white/10">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${product.stock <= 0 ? "opacity-50" : "cursor-pointer hover:translate-y-[-5px]"}`}
                  onClick={() => product.stock > 0 && addToBill(product)}
                >
                  <div className="p-3 flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <img
                        src={product.image || "/placeholder.svg?height=50&width=50"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-sm text-white">{product.name}</h3>
                        <p className="text-xs text-white/70">{product.brand}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">
                          ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                        {product.discount > 0 && (
                          <span className="ml-1 text-xs text-white/50 line-through">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.stock <= 0
                            ? "bg-red-500/30 text-white"
                            : product.stock <= product.minStock
                              ? "bg-yellow-500/30 text-white"
                              : "bg-green-500/30 text-white"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Bill */}
        <div className="md:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4 sticky top-20">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
              <ShoppingBag size={20} className="mr-2" /> Bill Items
            </h2>

            {billItems.length === 0 ? (
              <div className="text-center py-8 text-white/70">No items added to bill yet.</div>
            ) : (
              <div className="mb-4 max-h-[calc(100vh-350px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-white/10">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/20">
                    {billItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-xs text-white/70">{item.brand}</div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, e.target.value)}
                            className="w-12 p-1 text-sm border border-white/30 rounded-md bg-white/10 text-white"
                          />
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">
                            ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                          </div>
                          {item.discount > 0 && <div className="text-xs text-red-300">-{item.discount}%</div>}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-white">
                          ₹{calculateItemTotal(item).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-white/20 pt-4 mb-4">
              <div className="flex justify-between font-bold text-white">
                <span>Total Amount:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={billItems.length === 0 || isPrinting}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
            >
              {isPrinting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Printer size={18} className="mr-2" /> Print Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {showBillPreview && billData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Bill Preview</h2>
              <button
                onClick={() => setShowBillPreview(false)}
                className="text-white hover:text-white/80 transition-colors hover:scale-110"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-2 text-white">
                <strong>Customer:</strong> {billData.customer}
              </div>
              <div className="mb-2 text-white">
                <strong>Phone:</strong> {billData.customerPhone || "N/A"}
              </div>
              <div className="mb-2 text-white">
                <strong>Payment Method:</strong> {billData.paymentMethod}
              </div>
              <div className="mb-2 text-white">
                <strong>Total Amount:</strong> ₹{billData.totalAmount.toFixed(2)}
              </div>
              <ul className="text-white">
                {billData.items.map((item) => (
                  <li key={item._id} className="py-1 border-b border-white/20">
                    {item.name} - Qty: {item.quantity} - ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowBillPreview(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleConfirmBill}
                >
                  Confirm & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBill
