import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../lib/api'
import type { User } from '@chakula/shared-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  sendOtp: (phone: string) => Promise<{
    maskedPhone: string
    expiresIn: number
    canResendAt: number
  }>
  verifyOtp: (phone: string, otp: string) => Promise<{
    isNewUser: boolean
    setupToken?: string
  }>
  register: (setupToken: string, name: string, email: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INITIALIZE — check if user has valid token
  // Called on app startup (splash screen)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  initialize: async () => {
    try {
      set({ isLoading: true })

      const token = await SecureStore.getItemAsync('accessToken')

      if (!token) {
        set({ isInitialized: true, isLoading: false })
        return
      }

      // Validate token by calling /auth/me
      const response = await api.get('/auth/me')
      const user = response.data.data

      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      })
    } catch (error) {
      // Token invalid or expired — clear everything
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('refreshToken')

      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      })
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEND OTP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  sendOtp: async (phone: string) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/send-otp', { phone })
      return response.data.data
    } finally {
      set({ isLoading: false })
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFY OTP — returns isNewUser for routing
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp })
      const data = response.data.data

      if (data.isNewUser) {
        // New user — needs to complete registration
        return { isNewUser: true, setupToken: data.setupToken }
      }

      // Existing user — save tokens and user
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)

      set({
        user: data.user,
        isAuthenticated: true,
      })

      return { isNewUser: false }
    } finally {
      set({ isLoading: false })
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGISTER — complete profile after OTP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  register: async (setupToken: string, name: string, email: string) => {
    set({ isLoading: true })
    try {
      const response = await api.post(
        '/auth/register',
        { name, email },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      )
      const data = response.data.data

      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)

      set({
        user: data.user,
        isAuthenticated: true,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGOUT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', {
          refreshToken,
          logoutAll: false,
        }).catch(() => {
          // Don't block logout if API call fails
        })
      }
    } finally {
      await SecureStore.deleteItemAsync('accessToken')
      await SecureStore.deleteItemAsync('refreshToken')

      set({
        user: null,
        isAuthenticated: false,
      })
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET USER — update user data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setUser: (user: User) => set({ user }),
}))