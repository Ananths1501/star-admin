"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Search, Filter, X, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("name")
  const [showFilters, setShowFilters] = useState(false)
  const [types, setTypes] = useState([])
  const [brands, setBrands] = useState([])
  const [error, setError] = useState(null)
  const [productCounts, setProductCounts] = useState({}) // To track product counts by type

  useEffect(() => {
    fetchProducts()
    fetchFilters()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      filterProducts()
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, filterType, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get("/products")
      setProducts(response.data)
      setFilteredProducts(response.data)

      // Calculate product counts by type
      const counts = {}
      response.data.forEach((product) => {
        if (product.type) {
          counts[product.type] = (counts[product.type] || 0) + 1
        }
      })
      setProductCounts(counts)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again.")
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchFilters = async () => {
    try {
      const [typesRes, brandsRes] = await Promise.all([api.get("/products/types"), api.get("/products/brands")])
      setTypes(typesRes.data)
      setBrands(brandsRes.data)
    } catch (error) {
      console.error("Error fetching filters:", error)
    }
  }

  const filterProducts = () => {
    const filtered = products.filter((product) => {
      const searchValue = searchTerm.toLowerCase()

      switch (filterType) {
        case "name":
          return product.name.toLowerCase().includes(searchValue)
        case "brand":
          return product.brand.toLowerCase().includes(searchValue)
        case "type":
          return product.type.toLowerCase().includes(searchValue)
        case "productId":
          return product.productId.toLowerCase().includes(searchValue)
        default:
          return product.name.toLowerCase().includes(searchValue)
      }
    })

    setFilteredProducts(filtered)
  }

  const getSuggestions = () => {
    if (!searchTerm || searchTerm.length < 2) return []

    const searchValue = searchTerm.toLowerCase()
    let suggestions = []

    if (filterType === "brand") {
      suggestions = brands.filter((brand) => brand.toLowerCase().includes(searchValue))
    } else if (filterType === "type") {
      suggestions = types.filter((type) => type.toLowerCase().includes(searchValue))
    }

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchProducts()
  }

  const handleAddProduct = () => {
    setShowAddModal(true)
  }

  const handleEditProduct = (product) => {
    setCurrentProduct(product)
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setCurrentProduct(null)
  }

  const handleProductAdded = () => {
    fetchProducts()
    handleCloseModal()
    toast.success("Product added successfully")
  }

  const handleProductUpdated = () => {
    fetchProducts()
    handleCloseModal()
    toast.success("Product updated successfully")
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}`)
        fetchProducts()
        toast.success("Product deleted successfully")
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Failed to delete product")
      }
    }
  }

  // Generate product ID based on type and count
  const generateProductId = (type) => {
    if (!type) return ""
    const typePrefix = type.charAt(0).toUpperCase()
    const count = (productCounts[type] || 0) + 1
    return `${typePrefix}${count.toString().padStart(4, "0")}`
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
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:shadow-lg flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-gradient-to-r from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            <input
              type="text"
              placeholder={`Search by ${filterType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm transition-all duration-300"
            />
            {(filterType === "brand" || filterType === "type") && searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-md border border-white/20 shadow-lg max-h-60 overflow-auto">
                {getSuggestions().map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-white/10 text-white"
                    onClick={() => setSearchTerm(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
                {getSuggestions().length === 0 && <div className="px-4 py-2 text-white/70">No suggestions found</div>}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-red-600/30 hover:from-blue-600/40 hover:via-purple-600/40 hover:to-red-600/40 border border-white/30 rounded-md text-white transition-all duration-300 flex items-center"
            >
              <Filter size={18} className="mr-1" /> Filter
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("name")}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                filterType === "name"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setFilterType("brand")}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                filterType === "brand"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Brand
            </button>
            <button
              onClick={() => setFilterType("type")}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                filterType === "type"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Type
            </button>
            <button
              onClick={() => setFilterType("productId")}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                filterType === "productId"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Product ID
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 text-center">
          <p className="text-white/70">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg?height=200&width=300"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-white">{product.name}</h3>
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>{product.brand}</span>
                  <span>{product.type}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-bold text-white">
                      ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="ml-2 text-xs text-white/50 line-through">₹{product.price.toFixed(2)}</span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <span className="bg-red-500/30 text-white text-xs px-2 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/70">Stock: {product.stock}</span>
                  <span className="text-white/70">Min Stock: {product.minStock}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md flex items-center justify-center text-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md flex items-center justify-center text-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={handleCloseModal}
          onProductAdded={handleProductAdded}
          types={types}
          brands={brands}
          generateProductId={generateProductId}
          productCounts={productCounts}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && currentProduct && (
        <EditProductModal
          product={currentProduct}
          onClose={handleCloseModal}
          onProductUpdated={handleProductUpdated}
          types={types}
          brands={brands}
        />
      )}
    </div>
  )
}

const AddProductModal = ({ onClose, onProductAdded, types, brands, generateProductId, productCounts }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    price: "",
    discount: "0",
    stock: "",
    minStock: "",
    description: "",
    warranty: "0",
    productId: "",
  })
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }

      // Generate product ID when type changes
      if (name === "type" && value) {
        newState.productId = generateProductId(value)
      }

      return newState
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.brand ||
      !formData.type ||
      !formData.price ||
      !formData.stock ||
      !formData.minStock ||
      !formData.description
    ) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key])
      })

      if (image) {
        formDataObj.append("image", image)
      }

      await api.post("/products", formDataObj)
      onProductAdded()
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error(error.response?.data?.message || "Failed to add product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Add New Product</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/70"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Brand *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
                required
                style={{ backgroundImage: "none" }}
              >
                <option value="" className="bg-blue-900 text-white">
                  Select Brand
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand} className="bg-blue-900 text-white">
                    {brand}
                  </option>
                ))}
                <option value="other" className="bg-blue-900 text-white">
                  Other
                </option>
              </select>
              {formData.brand === "other" && (
                <input
                  type="text"
                  name="brand"
                  placeholder="Enter brand name"
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
                required
                style={{ backgroundImage: "none" }}
              >
                <option value="" className="bg-blue-900 text-white">
                  Select Type
                </option>
                {types.map((type) => (
                  <option key={type} value={type} className="bg-blue-900 text-white">
                    {type}
                  </option>
                ))}
                <option value="other" className="bg-blue-900 text-white">
                  Other
                </option>
              </select>
              {formData.type === "other" && (
                <input
                  type="text"
                  name="type"
                  placeholder="Enter product type"
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Warranty (months)</label>
              <input
                type="number"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Minimum Stock *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Product ID</label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm bg-white/10 text-white/70"
                disabled
              />
              <p className="text-xs text-white/50 mt-1">Auto-generated based on product type</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="h-32 object-contain rounded-md border border-white/20"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 p-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/30 rounded-md text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:-translate-y-1 active:translate-y-0 shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditProductModal = ({ product, onClose, onProductUpdated, types, brands }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    brand: product.brand,
    type: product.type,
    price: product.price,
    discount: product.discount,
    stock: product.stock,
    minStock: product.minStock,
    description: product.description,
    warranty: product.warranty || 0,
  })
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(product.image)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.brand ||
      !formData.type ||
      !formData.price ||
      !formData.stock ||
      !formData.minStock ||
      !formData.description
    ) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key])
      })

      if (image) {
        formDataObj.append("image", image)
      }

      await api.put(`/products/${product._id}`, formDataObj)
      onProductUpdated()
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error(error.response?.data?.message || "Failed to update product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Edit Product</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Brand *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
                required
                style={{ backgroundImage: "none" }}
              >
                <option value="" className="bg-blue-900 text-white">
                  Select Brand
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand} className="bg-blue-900 text-white">
                    {brand}
                  </option>
                ))}
                <option value="other" className="bg-blue-900 text-white">
                  Other
                </option>
              </select>
              {formData.brand === "other" && (
                <input
                  type="text"
                  name="brand"
                  placeholder="Enter brand name"
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Type *</label>
              <select
                name="type"
                value={types.includes(formData.type) ? formData.type : "other"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white backdrop-blur-sm"
                required
                style={{ backgroundImage: "none" }}
              >
                <option value="" className="bg-blue-900 text-white">
                  Select Type
                </option>
                {types.map((type) => (
                  <option key={type} value={type} className="bg-blue-900 text-white">
                    {type}
                  </option>
                ))}
                <option value="other" className="bg-blue-900 text-white">
                  Other
                </option>
              </select>
              {!types.includes(formData.type) && (
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  placeholder="Enter product type"
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Warranty (months)</label>
              <input
                type="number"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Minimum Stock *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Product ID</label>
              <input
                type="text"
                value={product.productId}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm bg-white/10 text-white/70"
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">Current Image</label>
            <img
              src={previewUrl || product.image || "/placeholder.svg?height=100&width=100"}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-md mb-2 border border-white/20"
            />
            <label className="block text-sm font-medium text-white mb-1 mt-2">Change Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 p-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/30 rounded-md text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:-translate-y-1 active:translate-y-0 shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProducts
