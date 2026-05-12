import { create } from 'zustand'

interface LocationState {
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string
  hasPermission: boolean
  setLocation: (lat: number, lng: number, address?: string) => void
  setCity: (city: string) => void
  setPermission: (granted: boolean) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  // Default to Nairobi CBD for demo
  latitude: -1.2921,
  longitude: 36.8219,
  address: 'Nairobi',
  city: 'Nairobi',
  hasPermission: false,

  setLocation: (lat, lng, address) =>
    set({ latitude: lat, longitude: lng, address: address ?? null }),

  setCity: (city) => set({ city }),

  setPermission: (granted) => set({ hasPermission: granted }),
}))