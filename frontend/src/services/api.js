import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Interceptor: add token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pot_token')
      localStorage.removeItem('pot_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
