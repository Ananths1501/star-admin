"use client"

import { useState, useEffect } from "react"
import { Edit, Filter, ArrowUp, ArrowDown, X, Check, AlertCircle, RefreshCw, Search } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const AdminStocks = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    brand: "",
    name: "",
    lowStock: false,
    sortBy: "name",
    order: "asc",
  })
  const [types, setTypes] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [productsRes, typesRes, brandsRes] = await Promise.all([
        api.get("/products"),
        api.get("/products/types"),
        api.get("/products/brands"),
      ])

      setProducts(productsRes.data)
      setTypes(typesRes.data)
      setBrands(brandsRes.data)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again.")
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]

    // Apply type filter
    if (filters.type) {
      result = result.filter((p) => p.type === filters.type)
    }

    // Apply brand filter
    if (filters.brand) {
      result = result.filter((p) => p.brand === filters.brand)
    }

    // Apply name filter
    if (filters.name) {
      result = result.filter((p) => p.name.toLowerCase().includes(filters.name.toLowerCase()))
    }

    // Apply low stock filter
    if (filters.lowStock) {
      result = result.filter((p) => p.stock <= p.minStock)
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB

      if (filters.sortBy === "stock") {
        valueA = a.stock
        valueB = b.stock
      } else if (filters.sortBy === "minStock") {
        valueA = a.minStock
        valueB = b.minStock
      } else if (filters.sortBy === "stockDiff") {
        valueA = a.stock - a.minStock
        valueB = b.stock - b.minStock
      } else if (filters.sortBy === "price") {
        valueA = a.price
        valueB = b.price
      } else {
        valueA = a.name.toLowerCase()
        valueB = b.name.toLowerCase()
      }

      if (filters.order === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredProducts(result)
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      brand: "",
      name: "",
      lowStock: false,
      sortBy: "name",
      order: "asc",
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchProducts()
  }

  const handleUpdateStock = (product) => {
    setCurrentProduct(product)
    setShowUpdateModal(true)
  }

  const handleEditRow = (product) => {
    setEditingProduct({
      ...product,
      newStock: product.stock,
      newMinStock: product.minStock,
    })
  }

  const handleSaveRow = async () => {
    if (!editingProduct) return

    try {
      setError(null)
      // Make sure we're sending integers, not strings
      const stock = Number(editingProduct.newStock)
      const minStock = Number(editingProduct.newMinStock)

      await api.patch(`/products/${editingProduct._id}/stock`, {
        stock,
        minStock,
      })

      // Update the product in the local state
      const updatedProducts = products.map((p) => (p._id === editingProduct._id ? { ...p, stock, minStock } : p))

      setProducts(updatedProducts)
      setEditingProduct(null)
      toast.success("Stock updated successfully")
    } catch (error) {
      console.error("Error updating stock:", error)
      setError("Failed to update stock. Please try again.")
      toast.error("Failed to update stock: " + (error.response?.data?.message || "Unknown error"))
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  const handleSort = (field) => {
    if (filters.sortBy === field) {
      setFilters({
        ...filters,
        order: filters.order === "asc" ? "desc" : "asc",
      })
    } else {
      setFilters({
        ...filters,
        sortBy: field,
        order: "asc",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Stock Management</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
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

      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center">
            <Filter size={18} className="mr-2 text-white/70" />
            <span className="font-medium text-white">Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
              >
                <option value="" className="bg-blue-900 text-white">
                  All Types
                </option>
                {types.map((type) => (
                  <option key={type} value={type} className="bg-blue-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.brand}
                onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
              >
                <option value="" className="bg-blue-900 text-white">
                  All Brands
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand} className="bg-blue-900 text-white">
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={(e) => setFilters((prev) => ({ ...prev, lowStock: e.target.checked }))}
                  className="rounded border-white/30 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span>Low Stock Only</span>
              </label>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("productId")}
                >
                  <div className="flex items-center">
                    Product ID
                    {filters.sortBy === "productId" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    {filters.sortBy === "type" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("brand")}
                >
                  <div className="flex items-center">
                    Brand
                    {filters.sortBy === "brand" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("stock")}
                >
                  <div className="flex items-center">
                    Stock
                    {filters.sortBy === "stock" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("minStock")}
                >
                  <div className="flex items-center">
                    Min Stock
                    {filters.sortBy === "minStock" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("stockDiff")}
                >
                  <div className="flex items-center">
                    Status
                    {filters.sortBy === "stockDiff" &&
                      (filters.order === "asc" ? (
                        <ArrowUp size={14} className="ml-1" />
                      ) : (
                        <ArrowDown size={14} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/20">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image || "/placeholder.svg?height=40&width=40"}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                      />
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-white/70 text-sm">{product.description.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white">{product.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white">{product.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.newStock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, newStock: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                      />
                    ) : (
                      <div className="text-white">{product.stock}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.newMinStock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, newMinStock: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                      />
                    ) : (
                      <div className="text-white">{product.minStock}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white">
                      {product.stock > product.minStock ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/30 text-white">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/30 text-white">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingProduct && editingProduct._id === product._id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveRow}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditRow(product)}
                          className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white p-1.5 rounded-md transition-all duration-300"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStocks
