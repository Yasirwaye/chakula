import { create } from 'zustand'
import type { ChosenCustomization } from '@chakula/shared-types'

export interface CartItem {
  menuItemId: string
  itemName: string
  itemImage: string | null
  basePrice: number
  unitPrice: number
  quantity: number
  chosenCustomizations: ChosenCustomization[]
  specialNote: string | null
}

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null

  addItem: (item: CartItem, restaurantId: string, restaurantName: string) => boolean
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
  hasItemFromDifferentRestaurant: (restaurantId: string) => boolean
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  addItem: (item, restaurantId, restaurantName) => {
    const state = get()

    // Different restaurant — don't add (caller must confirm)
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      return false
    }

    const existingIndex = state.items.findIndex(
      (i) => i.menuItemId === item.menuItemId &&
        JSON.stringify(i.chosenCustomizations) === JSON.stringify(item.chosenCustomizations)
    )

    if (existingIndex >= 0) {
      const updated = [...state.items]
      updated[existingIndex] = {
        ...updated[existingIndex]!,
        quantity: updated[existingIndex]!.quantity + item.quantity,
      }
      set({ items: updated })
    } else {
      set({
        items: [...state.items, item],
        restaurantId,
        restaurantName,
      })
    }
    return true
  },

  removeItem: (menuItemId) => {
    const items = get().items.filter((i) => i.menuItemId !== menuItemId)
    set({
      items,
      restaurantId: items.length === 0 ? null : get().restaurantId,
      restaurantName: items.length === 0 ? null : get().restaurantName,
    })
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  hasItemFromDifferentRestaurant: (restaurantId) => {
    const state = get()
    return state.restaurantId !== null && state.restaurantId !== restaurantId
  },
}))