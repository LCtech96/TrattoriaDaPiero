'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { checkAdminSession } from '@/lib/admin-session'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatPrice,
} from '@/lib/ecommerce'

interface OrderItem {
  id: number
  name: string
  unit: string | null
  quantity: number
  unitPriceCents: number
  totalCents: number
}

interface PaymentRecord {
  id: number
  amountCents: number
  currency: string
  provider: string
  providerRef: string | null
  status: string
  notes: string | null
  paidAt: string
}

interface AdminOrder {
  id: number
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string | null
  notes: string | null
  subtotalCents: number
  shippingCents: number
  totalCents: number
  currency: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  createdAt: string
  paidAt: string | null
  items: OrderItem[]
  payments: PaymentRecord[]
}

const MANUAL_METHODS = [
  { value: 'contanti', label: 'Contanti' },
  { value: 'bonifico', label: 'Bonifico' },
  { value: 'pos', label: 'POS' },
]

function statusClasses(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'shipped':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  }
}

export default function AdminOrders() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [summary, setSummary] = useState({
    totalCollectedCents: 0,
    paymentsCount: 0,
    pendingOrders: 0,
  })
  const [filter, setFilter] = useState('tutti')
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [manualPayment, setManualPayment] = useState({ method: 'contanti', amount: '', reference: '' })

  const loadOrders = useCallback(async (status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders?status=${encodeURIComponent(status)}`, {
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      setOrders(Array.isArray(data.orders) ? data.orders : [])
      if (data.summary) setSummary(data.summary)
    } catch {
      setError('Impossibile caricare gli ordini.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    checkAdminSession().then((ok) => {
      if (cancelled) return
      if (!ok) {
        router.push('/admin/login')
      } else {
        setIsAuthenticated(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) loadOrders(filter)
  }, [isAuthenticated, filter, loadOrders])

  const updateOrder = async (orderId: number, payload: Record<string, unknown>) => {
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || 'Aggiornamento non riuscito.')
        return
      }
      setNotice('Ordine aggiornato.')
      setManualPayment({ method: 'contanti', amount: '', reference: '' })
      await loadOrders(filter)
    } catch {
      setError('Errore di connessione.')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/admin/ecommerce"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline"
          >
            <ArrowLeft size={20} />
            Prodotti
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Ordini e Pagamenti
          </h1>
          <button
            onClick={() => loadOrders(filter)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            <RefreshCw size={18} />
            Aggiorna
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Totale incassato</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(summary.totalCollectedCents)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pagamenti registrati</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.paymentsCount}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ordini da incassare</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.pendingOrders}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['tutti', ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                (filter === status
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300')
              }
            >
              {status === 'tutti' ? 'Tutti' : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {notice && (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded-lg mb-4">
            {notice}
          </div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Caricamento…</p>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-600 dark:text-gray-400">
            Nessun ordine per questo filtro.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {order.customerName} · {order.customerEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        'px-2 py-0.5 rounded-full text-xs font-medium ' + statusClasses(order.status)
                      }
                    >
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.totalCents, order.currency)}
                    </span>
                  </div>
                </button>

                {expanded === order.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">Cliente</p>
                        <p>{order.customerName}</p>
                        <p>{order.customerEmail}</p>
                        {order.customerPhone && <p>{order.customerPhone}</p>}
                        {order.shippingAddress && <p className="mt-1">{order.shippingAddress}</p>}
                        {order.notes && <p className="mt-1 italic">Note: {order.notes}</p>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">Ordine</p>
                        <p>Creato il {new Date(order.createdAt).toLocaleString('it-IT')}</p>
                        {order.paidAt && (
                          <p>Pagato il {new Date(order.paidAt).toLocaleString('it-IT')}</p>
                        )}
                        {order.paymentMethod && <p>Metodo: {order.paymentMethod}</p>}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Articoli</p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-3">
                            <span>
                              {item.quantity} × {item.name}
                              {item.unit ? ` (${item.unit})` : ''}
                            </span>
                            <span>{formatPrice(item.totalCents, order.currency)}</span>
                          </li>
                        ))}
                        {order.shippingCents > 0 && (
                          <li className="flex justify-between gap-3">
                            <span>Spedizione</span>
                            <span>{formatPrice(order.shippingCents, order.currency)}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        Pagamenti ricevuti
                      </p>
                      {order.payments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nessun pagamento registrato.
                        </p>
                      ) : (
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {order.payments.map((payment) => (
                            <li key={payment.id} className="flex justify-between gap-3">
                              <span>
                                {new Date(payment.paidAt).toLocaleDateString('it-IT')} ·{' '}
                                {payment.provider}
                                {payment.providerRef ? ` · ${payment.providerRef}` : ''}
                              </span>
                              <span>{formatPrice(payment.amountCents, payment.currency)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Stato ordine
                        <select
                          value={order.status}
                          onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                          className="ml-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {ORDER_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {order.paymentStatus !== 'paid' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          Registra un incasso manuale
                        </p>
                        <div className="flex flex-wrap items-end gap-3">
                          <label className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="block mb-1">Metodo</span>
                            <select
                              value={manualPayment.method}
                              onChange={(e) =>
                                setManualPayment({ ...manualPayment, method: e.target.value })
                              }
                              className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {MANUAL_METHODS.map((method) => (
                                <option key={method.value} value={method.value}>
                                  {method.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="block mb-1">Importo (€)</span>
                            <input
                              inputMode="decimal"
                              placeholder={(order.totalCents / 100).toFixed(2).replace('.', ',')}
                              value={manualPayment.amount}
                              onChange={(e) =>
                                setManualPayment({ ...manualPayment, amount: e.target.value })
                              }
                              className="w-28 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </label>
                          <label className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="block mb-1">Riferimento</span>
                            <input
                              placeholder="CRO, scontrino…"
                              value={manualPayment.reference}
                              onChange={(e) =>
                                setManualPayment({ ...manualPayment, reference: e.target.value })
                              }
                              className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </label>
                          <button
                            onClick={() =>
                              updateOrder(order.id, {
                                payment: {
                                  method: manualPayment.method,
                                  amount: manualPayment.amount,
                                  reference: manualPayment.reference,
                                },
                              })
                            }
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                          >
                            Segna come incassato
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Lasciando vuoto l&apos;importo viene registrato il totale dell&apos;ordine.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
