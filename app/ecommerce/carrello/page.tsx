'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
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
    <PageShell>
      <div>
        <div className="container py-10 sm:py-14 max-w-4xl">
          <p className="eyebrow mb-4 flex justify-center">Shop online</p>
          <h1 className="display text-center mb-10 text-maiolica-900 dark:text-cream-50">
            Il tuo carrello
          </h1>

          {info && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200 mb-6">
              {info}
            </div>
          )}

          {!hydrated ? (
            <p className="text-center text-ink-muted dark:text-cream-200/60 py-12">Caricamento…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-ink-soft dark:text-cream-200/70 mb-4">
                Il carrello è vuoto.
              </p>
              <Link
                href="/ecommerce"
                className="btn-primary"
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
                    className="flex items-center gap-3 card p-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 dark:bg-maiolica-950 flex-shrink-0">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-maiolica-900 dark:text-cream-50 truncate">
                        {item.name}
                      </p>
                      {item.unit && (
                        <p className="text-xs text-ink-muted dark:text-cream-200/60">{item.unit}</p>
                      )}
                      <p className="text-sm text-ink-soft dark:text-cream-200/70">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>
                    <div className="flex items-center border border-cream-300 dark:border-white/15 rounded-full">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-ink-soft dark:text-cream-200/80"
                        aria-label="Riduci quantità"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm text-maiolica-900 dark:text-cream-50">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 text-ink-soft dark:text-cream-200/80"
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

              <div className="flex justify-between items-center text-xl font-bold text-maiolica-900 dark:text-cream-50 mb-8">
                <span>Totale</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-4">
                <h2 className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">
                  I tuoi dati
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="label">
                      Nome e cognome *
                    </span>
                    <input
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="label">
                      Email *
                    </span>
                    <input
                      required
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="label">
                      Telefono
                    </span>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="label">
                      Indirizzo di spedizione
                    </span>
                    <input
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      className="input"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="label">
                    Note per l&apos;ordine
                  </span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input"
                  />
                </label>

                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-red-700 dark:bg-red-500/10 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? 'Attendi…' : `Paga ${formatPrice(subtotal)}`}
                </button>
                <p className="text-xs text-center text-ink-muted dark:text-cream-200/60">
                  Il pagamento avviene su pagina sicura Stripe. Eventuali spese di spedizione
                  vengono mostrate prima della conferma.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopCartPage />
    </Suspense>
  )
}
