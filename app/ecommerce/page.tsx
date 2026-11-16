'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Search } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { cn } from '@/lib/utils'
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
    <PageShell>
      <PageHeader
        eyebrow="Shop online"
        title="I prodotti di Piero"
        description="I prodotti della Trattoria Da Piero, direttamente a casa tua."
      >
        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca un prodotto…"
              aria-label="Cerca un prodotto"
              className="input !rounded-full !pl-11"
            />
          </div>
          <Link href="/ecommerce/carrello" className="btn-primary shrink-0">
            <ShoppingBag size={17} />
            Carrello{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
        </div>
      </PageHeader>

      <div className="container py-10">
        {categories.length > 2 && (
          <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {categories.map((name) => (
              <button
                key={name}
                onClick={() => setCategory(name)}
                className={cn('chip', category === name && 'chip-active')}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-square animate-pulse bg-cream-200 dark:bg-maiolica-800" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-cream-200 dark:bg-maiolica-800" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-cream-200 dark:bg-maiolica-800" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-maiolica-700/10 text-maiolica-700 dark:bg-limone-400/15 dark:text-limone-300">
              <ShoppingBag size={26} />
            </span>
            <p className="mt-5 font-serif text-2xl text-maiolica-900 dark:text-cream-50">
              {products.length === 0 ? 'Vetrina in allestimento' : 'Nessun risultato'}
            </p>
            <p className="mt-2 text-ink-soft dark:text-cream-200/70">
              {products.length === 0
                ? 'Nessun prodotto in vetrina al momento. Torna a trovarci presto!'
                : 'Nessun prodotto corrisponde alla ricerca.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
