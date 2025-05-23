"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Wrench, X, Edit, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const AdminServices = () => {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false)
  const [showWorkersModal, setShowWorkersModal] = useState(false)
  const [showEditWorkerModal, setShowEditWorkerModal] = useState(false)
  const [currentService, setCurrentService] = useState(null)
  const [currentWorker, setCurrentWorker] = useState(null)
  const [error, setError] = useState(null)
  const [preSelectedServiceType, setPreSelectedServiceType] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get("/services")
      setServices(response.data)
    } catch (error) {
      console.error("Error fetching services:", error)
      setError("Failed to load services. Please try again.")
      toast.error("Failed to load services")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchServices()
  }

  const handleAddService = () => {
    setShowAddServiceModal(true)
  }

  const handleAddWorker = () => {
    setShowAddWorkerModal(true)
  }

  const handleViewWorkers = (service) => {
    setCurrentService(service)
    setShowWorkersModal(true)
  }

  const handleEditWorker = (worker) => {
    setCurrentWorker(worker)
    setShowEditWorkerModal(true)
  }

  const handleCloseModal = () => {
    setShowAddServiceModal(false)
    setShowAddWorkerModal(false)
    setShowWorkersModal(false)
    setShowEditWorkerModal(false)
    setCurrentService(null)
    setCurrentWorker(null)
    setPreSelectedServiceType("")
  }

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service? This will also delete all associated workers.")) {
      try {
        await api.delete(`/services/${serviceId}`)
        fetchServices()
        toast.success("Service deleted successfully")
      } catch (error) {
        console.error("Error deleting service:", error)
        toast.error("Failed to delete service")
      }
    }
  }

  const handleAddWorkerForService = (serviceType) => {
    setPreSelectedServiceType(serviceType)
    setShowAddWorkerModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full scroll-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Services Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:shadow-lg flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 text-center">
          <Wrench className="mx-auto text-white/40 text-5xl mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">No services available</h2>
          <p className="text-white/70 mb-6">Start by adding a new service.</p>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:shadow-lg"
          >
            Add Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg?height=200&width=300"}
                  alt={service.serviceType}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-3 text-white">{service.serviceType}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">
                    {service.workers.length} Worker{service.workers.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewWorkers(service)}
                      className="py-2 px-3 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md flex items-center justify-center text-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <Eye size={16} className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md flex items-center justify-center text-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <AddServiceModal
          onClose={handleCloseModal}
          onServiceAdded={fetchServices}
          onAddWorkerForService={handleAddWorkerForService}
        />
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <AddWorkerModal
          services={services}
          onClose={handleCloseModal}
          onWorkerAdded={fetchServices}
          preSelectedServiceType={preSelectedServiceType}
        />
      )}

      {/* View Workers Modal */}
      {showWorkersModal && currentService && (
        <ViewWorkersModal
          service={currentService}
          onClose={handleCloseModal}
          onEditWorker={handleEditWorker}
          onWorkersUpdated={fetchServices}
          onAddWorkerForService={handleAddWorkerForService}
        />
      )}

      {/* Edit Worker Modal */}
      {showEditWorkerModal && currentWorker && (
        <EditWorkerModal
          worker={currentWorker}
          services={services}
          onClose={handleCloseModal}
          onWorkerUpdated={fetchServices}
        />
      )}
    </div>
  )
}

const AddServiceModal = ({ onClose, onServiceAdded, onAddWorkerForService }) => {
  const [serviceType, setServiceType] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

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

    if (!serviceType) {
      toast.error("Service type is required")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("serviceType", serviceType)
      formData.append("description", description)

      if (image) {
        formData.append("image", image)
      }

      const response = await api.post("/services", formData)
      onServiceAdded()
      toast.success("Service added successfully")

      // Ask user if they want to add a worker for this service
      if (window.confirm(`Would you like to add a worker for the new ${serviceType} service?`)) {
        // Close current modal and open add worker modal with pre-selected service type
        onClose()
        onAddWorkerForService(serviceType)
      }
    } catch (error) {
      console.error("Error adding service:", error)
      toast.error(error.response?.data?.message || "Failed to add service")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Add New Service</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Service Type *</label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">Service Image</label>
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
              {isLoading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AddWorkerModal = ({ services, onClose, onWorkerAdded, preSelectedServiceType }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    serviceType: preSelectedServiceType || "",
    feesPerDay: "",
  })
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.address || !formData.serviceType || !formData.feesPerDay) {
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

      await api.post("/services/workers", formDataObj)
      onWorkerAdded()
      toast.success("Worker added successfully")
    } catch (error) {
      console.error("Error adding worker:", error)
      toast.error(error.response?.data?.message || "Failed to add worker")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Add New Worker</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            >
              <option value="">Select Service Type</option>
              {services.map((service) => (
                <option key={service._id} value={service.serviceType}>
                  {service.serviceType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Fees Per Day (₹) *</label>
            <input
              type="number"
              name="feesPerDay"
              value={formData.feesPerDay}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
            />
            {previewUrl && (
              <div className="mt-3">
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
              {isLoading ? "Adding..." : "Add Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewWorkersModal = ({ service, onClose, onEditWorker, onWorkersUpdated, onAddWorkerForService }) => {
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get(`/services/${service._id}/workers`)
        setWorkers(response.data)
      } catch (error) {
        console.error("Error fetching workers:", error)
        setError("Failed to load workers. Please try again.")
        toast.error("Failed to load workers")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkers()
  }, [service._id])

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await api.delete(`/services/workers/${workerId}`)
        setWorkers(workers.filter((worker) => worker._id !== workerId))
        toast.success("Worker deleted successfully")
        onWorkersUpdated()
      } catch (error) {
        console.error("Error deleting worker:", error)
        toast.error("Failed to delete worker")
      }
    }
  }

  const handleAddWorker = () => {
    onClose()
    onAddWorkerForService(service.serviceType)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">{service.serviceType} Workers</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-3 text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-8 text-white/70">No workers available for this service.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <div key={worker._id} className="bg-white/10 rounded-lg p-4 flex border border-white/20">
                  <img
                    src={worker.image || "/placeholder.svg?height=80&width=80"}
                    alt={worker.name}
                    className="w-20 h-20 object-cover rounded-full mr-4 border border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{worker.name}</h3>
                    <p className="text-sm text-white/70">Phone: {worker.phone}</p>
                    <p className="text-sm text-white/70">Fees: ₹{worker.feesPerDay}/day</p>
                    <p className="text-sm text-white/70 mt-1">{worker.address}</p>
                    <div className="flex mt-2 gap-2">
                      <button
                        onClick={() => onEditWorker(worker)}
                        className="py-1 px-3 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md flex items-center text-xs transition-all duration-300 hover:shadow-lg"
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker._id)}
                        className="py-1 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md flex items-center text-xs transition-all duration-300 hover:shadow-lg"
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-white/20">
          <button
            onClick={handleAddWorker}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white rounded-md transition-all duration-300 hover:shadow-lg flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add Worker
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-red-600/30 hover:from-blue-600/40 hover:via-purple-600/40 hover:to-red-600/40 border border-white/30 rounded-md text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const EditWorkerModal = ({ worker, services, onClose, onWorkerUpdated }) => {
  const [formData, setFormData] = useState({
    name: worker.name,
    phone: worker.phone,
    address: worker.address,
    serviceType: worker.serviceType,
    feesPerDay: worker.feesPerDay,
    status: worker.status || "Available",
  })
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(worker.image)

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

    if (!formData.name || !formData.phone || !formData.address || !formData.serviceType || !formData.feesPerDay) {
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

      await api.put(`/services/workers/${worker._id}`, formDataObj)
      onWorkerUpdated()
      toast.success("Worker updated successfully")
    } catch (error) {
      console.error("Error updating worker:", error)
      toast.error(error.response?.data?.message || "Failed to update worker")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-b from-blue-900/90 via-purple-800/90 to-red-800/90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md animate-slide-up border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Edit Worker</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors hover:scale-110">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            >
              <option value="">Select Service Type</option>
              {services.map((service) => (
                <option key={service._id} value={service.serviceType}>
                  {service.serviceType}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Fees Per Day (₹) *</label>
            <input
              type="number"
              name="feesPerDay"
              value={formData.feesPerDay}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Current Image</label>
            <img
              src={previewUrl || worker.image || "/placeholder.svg?height=100&width=100"}
              alt={worker.name}
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
              {isLoading ? "Updating..." : "Update Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminServices
