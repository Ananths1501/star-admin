import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:4000/api",
})

// Simplified request interceptor
api.interceptors.request.use(
  (config) => {
    // Add a dummy token for all requests
    config.headers.Authorization = `Bearer test-token`
    return config
  },
  (error) => Promise.reject(error),
)

// Simplified response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)

export default api
