'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
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
    <PageShell>
      <div>
        <div className="container py-6 sm:py-10">
          <Link
            href="/ecommerce"
            className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-maiolica-700 hover:text-maiolica-900 dark:text-cream-200 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            <span>Torna allo shop</span>
          </Link>

          {isLoading ? (
            <p className="text-center text-ink-muted dark:text-cream-200/60 py-12">Caricamento…</p>
          ) : !product ? (
            <div className="text-center py-12">
              <p className="text-lg text-ink-soft dark:text-cream-200/70 mb-4">
                Prodotto non trovato o non più disponibile.
              </p>
              <button
                onClick={() => router.push('/ecommerce')}
                className="btn-primary"
              >
                Vai alla vetrina
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-14 max-w-6xl mx-auto">
              <div>
                <div className="aspect-square rounded-3xl overflow-hidden shadow-soft bg-cream-100 dark:bg-maiolica-950">
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted">
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
                          (activeImage === src ? 'border-maiolica-700 dark:border-limone-400' : 'border-transparent')
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
                <p className="eyebrow text-arancia-600 dark:text-limone-300 font-semibold">
                  {product.category}
                </p>
                <h1 className="font-serif text-3xl md:text-5xl leading-tight text-maiolica-900 dark:text-cream-50 mt-2">
                  {product.name}
                </h1>
                {product.unit && (
                  <p className="text-ink-muted dark:text-cream-200/60 mt-1">Formato: {product.unit}</p>
                )}

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-serif text-4xl tabular-nums text-arancia-600 dark:text-limone-300">
                    {formatPrice(product.priceCents, product.currency)}
                  </span>
                  {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                    <span className="text-lg text-ink-muted line-through">
                      {formatPrice(product.comparePriceCents, product.currency)}
                    </span>
                  )}
                </div>

                <p className="text-sm mt-2 text-ink-soft dark:text-cream-200/70">
                  {soldOut ? 'Non disponibile' : `Disponibilità: ${product.stock} pezzi`}
                </p>

                {product.description && (
                  <p className="text-ink-soft dark:text-cream-200/80 mt-6 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                )}

                {!soldOut && (
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex items-center border border-cream-300 dark:border-white/15 rounded-full">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-ink-soft dark:text-cream-200/80"
                        aria-label="Riduci quantità"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center text-maiolica-900 dark:text-cream-50">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2 text-ink-soft dark:text-cream-200/80"
                        aria-label="Aumenta quantità"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handleAdd}
                      className="btn-primary flex-1"
                    >
                      {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                      {added ? 'Aggiunto al carrello' : 'Aggiungi al carrello'}
                    </button>
                  </div>
                )}

                <Link
                  href="/ecommerce/carrello"
                  className="block text-center mt-4 text-arancia-600 dark:text-limone-300 font-semibold hover:underline"
                >
                  Vai al carrello
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
