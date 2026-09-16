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
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/ecommerce/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Nessuna immagine
            </div>
          )}
          {soldOut && (
            <span className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Esaurito
            </span>
          )}
          {!soldOut && product.isFeatured && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              In vetrina
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <Link href={`/ecommerce/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">
            {product.name}
          </h3>
        </Link>
        {product.unit && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.unit}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-end justify-between gap-2 mt-4">
          <div>
            {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
              <span className="block text-xs text-gray-400 line-through">
                {formatPrice(product.comparePriceCents, product.currency)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Aggiunto' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  )
}
