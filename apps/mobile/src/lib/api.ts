import axios, { type AxiosError } from 'axios'
import * as SecureStore from 'expo-secure-store'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Development: use your local IP or localhost
// Production: api.chakula.com
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const API_URL = __DEV__
  ? 'http://localhost:3000/v1'
  : 'https://api.chakula.com/v1'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST — attach stored access token
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE — auto refresh on 401
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers!.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data

        await SecureStore.setItemAsync('accessToken', newAccess)
        if (newRefresh) await SecureStore.setItemAsync('refreshToken', newRefresh)

        original.headers!.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPED API HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string, deviceId?: string) =>
    api.post('/auth/verify-otp', { phone, otp, deviceId }),
  register: (name: string, email: string, setupToken: string) =>
    api.post('/auth/register', { name, email }, {
      headers: { Authorization: `Bearer ${setupToken}` },
    }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken, logoutAll: false }),
  me: () => api.get('/auth/me'),
}

export const restaurantApi = {
  getHomeData: (lat?: number, lng?: number) =>
    api.get('/home-data', { params: { lat, lng } }),
  getRestaurants: (params: Record<string, unknown>) =>
    api.get('/restaurants', { params }),
  getRestaurant: (idOrSlug: string, lat?: number, lng?: number) =>
    api.get(`/restaurants/${idOrSlug}`, { params: { lat, lng } }),
  getMenu: (restaurantId: string) =>
    api.get(`/restaurants/${restaurantId}/menu`),
  getReviews: (restaurantId: string, page = 1) =>
    api.get(`/restaurants/${restaurantId}/reviews`, { params: { page } }),
  toggleFavorite: (restaurantId: string) =>
    api.post(`/users/me/favorites/${restaurantId}`),
  getFavorites: () => api.get('/users/me/favorites'),
}

export const searchApi = {
  search: (q: string, params?: Record<string, unknown>) =>
    api.get('/search', { params: { q, ...params } }),
  suggestions: (q: string) =>
    api.get('/search/suggestions', { params: { q } }),
  trending: () => api.get('/search/trending'),
}