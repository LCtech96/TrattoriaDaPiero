'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ShoppingBag, Search } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useShopCartStore } from '@/store/shop-cart-store'
import type { PublicProduct } from '@/lib/ecommerce'

export default function EcommercePage() {
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tutti')
  const hydrate = useShopCartStore((state) => state.hydrate)
  const items = useShopCartStore((state) => state.items)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    let cancelled = false
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : [])
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => ['Tutti', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products]
  )

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      if (category !== 'Tutti' && product.category !== category) return false
      if (!needle) return true
      return (
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      )
    })
  }, [products, query, category])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={18} />
              <span>Indietro</span>
            </Link>
            <Link
              href="/ecommerce/carrello"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={18} />
              Carrello{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            E-commerce
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            I prodotti della Trattoria Da Piero, direttamente a casa tua.
          </p>

          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca un prodotto…"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((name) => (
                <button
                  key={name}
                  onClick={() => setCategory(name)}
                  className={
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                    (category === name
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')
                  }
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              Caricamento prodotti…
            </p>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {products.length === 0
                  ? 'Nessun prodotto in vetrina al momento. Torna a trovarci presto!'
                  : 'Nessun prodotto corrisponde alla ricerca.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
