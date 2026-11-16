'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/theme-store'
import { useCartStore } from '@/store/cart-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme)
  const hydrateCart = useCartStore((s) => s.hydrate)

  useEffect(() => {
    initTheme()
    hydrateCart()
  }, [initTheme, hydrateCart])

  return <>{children}</>
}
