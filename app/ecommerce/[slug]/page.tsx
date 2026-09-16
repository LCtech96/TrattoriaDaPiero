'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { formatPrice, type PublicProduct } from '@/lib/ecommerce'
import { useShopCartStore } from '@/store/shop-cart-store'

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const addItem = useShopCartStore((state) => state.addItem)
  const hydrate = useShopCartStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!params?.slug) return
    let cancelled = false
    fetch(`/api/products/${params.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        setProduct(data?.product ?? null)
        setActiveImage(data?.product?.imageUrl ?? null)
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params?.slug])

  const handleAdd = () => {
    if (!product) return
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        unit: product.unit,
        imageUrl: product.imageUrl,
        maxQuantity: product.stock,
      },
      quantity
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const gallery = product ? [product.imageUrl, ...product.images].filter(Boolean) as string[] : []
  const soldOut = product ? product.stock <= 0 : false

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/ecommerce"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 mb-6 transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Torna all&apos;e-commerce</span>
          </Link>

          {isLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Caricamento…</p>
          ) : !product ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Prodotto non trovato o non più disponibile.
              </p>
              <button
                onClick={() => router.push('/ecommerce')}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold"
              >
                Vai alla vetrina
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Nessuna immagine
                    </div>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {gallery.map((src) => (
                      <button
                        key={src}
                        onClick={() => setActiveImage(src)}
                        className={
                          'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ' +
                          (activeImage === src ? 'border-amber-500' : 'border-transparent')
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold">
                  {product.category}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {product.name}
                </h1>
                {product.unit && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Formato: {product.unit}</p>
                )}

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.priceCents, product.currency)}
                  </span>
                  {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.comparePriceCents, product.currency)}
                    </span>
                  )}
                </div>

                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  {soldOut ? 'Non disponibile' : `Disponibilità: ${product.stock} pezzi`}
                </p>

                {product.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-6 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                )}

                {!soldOut && (
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-gray-700 dark:text-gray-300"
                        aria-label="Riduci quantità"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2 text-gray-700 dark:text-gray-300"
                        aria-label="Aumenta quantità"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handleAdd}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                    >
                      {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                      {added ? 'Aggiunto al carrello' : 'Aggiungi al carrello'}
                    </button>
                  </div>
                )}

                <Link
                  href="/ecommerce/carrello"
                  className="block text-center mt-4 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  Vai al carrello
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
