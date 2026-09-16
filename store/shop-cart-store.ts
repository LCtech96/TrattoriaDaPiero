import { create } from 'zustand'

/**
 * Carrello dell'e-commerce, separato da quello del menù del ristorante
 * (che serve per le ordinazioni al tavolo via WhatsApp).
 * I prezzi salvati qui servono solo a mostrare il totale: al checkout il
 * server rilegge sempre i prezzi reali dal database.
 */
export interface ShopCartItem {
  productId: number
  slug: string
  name: string
  priceCents: number
  unit: string | null
  imageUrl: string | null
  quantity: number
  maxQuantity: number
}

interface ShopCartStore {
  items: ShopCartItem[]
  hydrated: boolean
  hydrate: () => void
  addItem: (item: Omit<ShopCartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getCount: () => number
  getSubtotalCents: () => number
}

const STORAGE_KEY = 'shop-cart-storage'

function persist(items: ShopCartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
  } catch {
    // Storage pieno o disabilitato: il carrello resta comunque in memoria.
  }
}

export const useShopCartStore = create<ShopCartStore>()((set, get) => ({
  items: [],
  // Il carrello si legge dopo il mount, non durante il render iniziale,
  // altrimenti server e client producono HTML diversi (errore di idratazione).
  hydrated: false,

  hydrate: () => {
    if (get().hydrated || typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const items = stored ? JSON.parse(stored)?.items : null
      set({ items: Array.isArray(items) ? items : [], hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      const items = existing
        ? state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.maxQuantity || 99) }
              : i
          )
        : [...state.items, { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }]
      persist(items)
      return { items }
    })
  },

  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter((i) => i.productId !== productId)
      persist(items)
      return { items }
    })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => {
      const items = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxQuantity || 99) } : i
      )
      persist(items)
      return { items }
    })
  },

  clearCart: () => {
    persist([])
    set({ items: [] })
  },

  getCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getSubtotalCents: () =>
    get().items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
}))
