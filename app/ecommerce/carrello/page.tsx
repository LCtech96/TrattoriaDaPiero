'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { formatPrice } from '@/lib/ecommerce'
import { useShopCartStore } from '@/store/shop-cart-store'

function ShopCartPage() {
  const searchParams = useSearchParams()
  const { items, hydrated, hydrate, updateQuantity, removeItem, getSubtotalCents, clearCart } =
    useShopCartStore()
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (searchParams.get('annullato')) {
      setInfo('Pagamento annullato. Il carrello è ancora qui quando vuoi riprovare.')
    }
  }, [searchParams])

  const subtotal = getSubtotalCents()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || 'Non è stato possibile completare l\'ordine.')
        return
      }

      if (data.checkoutUrl) {
        // Il carrello si svuota solo dopo il pagamento (via pagina di ritorno),
        // così se l'utente annulla su Stripe non perde l'ordine.
        window.location.href = data.checkoutUrl
        return
      }

      clearCart()
      setInfo(
        data.message ||
          `Ordine ${data.orderNumber} registrato. Ti contatteremo per il pagamento.`
      )
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Carrello E-commerce
          </h1>

          {info && (
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
              {info}
            </div>
          )}

          {!hydrated ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Caricamento…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Il carrello è vuoto.
              </p>
              <Link
                href="/ecommerce"
                className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold"
              >
                Vai alla vetrina
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-8">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow p-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      {item.unit && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-gray-700 dark:text-gray-300"
                        aria-label="Riduci quantità"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 text-gray-700 dark:text-gray-300"
                        aria-label="Aumenta quantità"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-red-600 hover:text-red-700"
                      aria-label="Rimuovi dal carrello"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white mb-8">
                <span>Totale</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  I tuoi dati
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome e cognome *
                    </span>
                    <input
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </span>
                    <input
                      required
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefono
                    </span>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Indirizzo di spedizione
                    </span>
                    <input
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Note per l&apos;ordine
                  </span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>

                {error && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Attendi…' : `Paga ${formatPrice(subtotal)}`}
                </button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Il pagamento avviene su pagina sicura Stripe. Eventuali spese di spedizione
                  vengono mostrate prima della conferma.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopCartPage />
    </Suspense>
  )
}
