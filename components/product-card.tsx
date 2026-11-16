'use client'

import Link from 'next/link'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { formatPrice, type PublicProduct } from '@/lib/ecommerce'
import { useShopCartStore } from '@/store/shop-cart-store'

export function ProductCard({ product }: { product: PublicProduct }) {
  const addItem = useShopCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)
  const soldOut = product.stock <= 0

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      unit: product.unit,
      imageUrl: product.imageUrl,
      maxQuantity: product.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/ecommerce/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-cream-100 dark:bg-maiolica-950">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="tile-band h-full w-full opacity-30" aria-hidden />
          )}
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-maiolica-950/80 px-2.5 py-1 text-xs font-semibold text-white">
              Esaurito
            </span>
          )}
          {!soldOut && product.isFeatured && (
            <span className="absolute left-2 top-2 rounded-full bg-limone-400 px-2.5 py-1 text-xs font-semibold text-maiolica-950">
              In vetrina
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/ecommerce/${product.slug}`}>
          <h3 className="font-serif text-base leading-snug text-maiolica-900 dark:text-cream-50 sm:text-lg">
            {product.name}
          </h3>
        </Link>
        {product.unit && <p className="mt-0.5 text-xs text-ink-muted dark:text-cream-200/60">{product.unit}</p>}
        <p className="mt-2 line-clamp-2 hidden flex-1 text-sm text-ink-soft dark:text-cream-200/70 sm:block">
          {product.description}
        </p>

        <div className="mt-3 flex flex-1 flex-col justify-end gap-2 sm:mt-4 sm:flex-none sm:flex-row sm:items-end sm:justify-between">
          <div>
            {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
              <span className="block text-xs text-ink-muted line-through">
                {formatPrice(product.comparePriceCents, product.currency)}
              </span>
            )}
            <span className="text-lg font-semibold tabular-nums text-arancia-600 dark:text-limone-300">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          <button onClick={handleAdd} disabled={soldOut} className="btn-primary !min-h-[40px] !px-4 !py-2">
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Aggiunto' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  )
}
