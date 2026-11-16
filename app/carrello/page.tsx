'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageShell, PageHeader } from '@/components/page-shell'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Trash2, UtensilsCrossed, MessageCircle } from 'lucide-react'
import { OrderModal } from '@/components/order-modal'

export default function CarrelloPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <PageShell>
      <PageHeader
        eyebrow="Ordina"
        title="Il tuo ordine"
        crumbs={[{ href: '/menu', label: 'Menù' }]}
        description={
          items.length > 0
            ? `${count} ${count === 1 ? 'piatto' : 'piatti'} nel carrello. Invia l'ordine su WhatsApp, al tavolo o da asporto.`
            : undefined
        }
      />

      <div className="container max-w-5xl py-10">
        {items.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-maiolica-700/10 text-maiolica-700 dark:bg-limone-400/15 dark:text-limone-300">
              <UtensilsCrossed size={26} />
            </span>
            <p className="mt-5 font-serif text-2xl text-maiolica-900 dark:text-cream-50">Il carrello è vuoto</p>
            <p className="mt-2 text-ink-soft dark:text-cream-200/70">
              Sfoglia il menù e tocca un piatto per aggiungerlo.
            </p>
            <Link href="/menu" className="btn-primary mt-6">
              Vai al menù
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <ul className="space-y-3 lg:col-span-7">
              {items.map((item) => (
                <li key={item.id} className="card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl text-maiolica-900 dark:text-cream-50">{item.name}</h3>
                      {item.addedIngredients.length > 0 && (
                        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                          + {item.addedIngredients.join(', ')}
                        </p>
                      )}
                      {item.removedIngredients.length > 0 && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                          senza {item.removedIngredients.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      aria-label={`Rimuovi ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-cream-300 dark:border-white/15">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="grid h-10 w-10 place-items-center rounded-full hover:bg-maiolica-700/5"
                        aria-label="Diminuisci quantità"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="grid h-10 w-10 place-items-center rounded-full hover:bg-maiolica-700/5"
                        aria-label="Aumenta quantità"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-lg font-semibold tabular-nums text-arancia-600 dark:text-limone-300">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:col-span-5">
              <div className="card sticky top-[calc(var(--header-h)+1.5rem)] p-6">
                <h2 className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">Riepilogo</h2>
                <dl className="mt-5 space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-ink-soft dark:text-cream-200/70">
                      <dt className="truncate">
                        {item.quantity}× {item.name}
                      </dt>
                      <dd className="tabular-nums">{formatPrice(item.price * item.quantity)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex items-baseline justify-between border-t border-cream-200 pt-5 dark:border-white/10">
                  <span className="font-semibold">Totale</span>
                  <span className="font-serif text-3xl tabular-nums text-maiolica-900 dark:text-cream-50">
                    {formatPrice(getTotal())}
                  </span>
                </div>
                <button onClick={() => setIsOrderModalOpen(true)} className="btn-primary mt-6 w-full">
                  <MessageCircle size={17} /> Procedi con l&apos;ordine
                </button>
                <Link href="/menu" className="btn-outline mt-3 w-full">
                  Aggiungi altri piatti
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>

      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </PageShell>
  )
}
