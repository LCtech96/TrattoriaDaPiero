'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Plus, Receipt, Trash2, X } from 'lucide-react'
import { checkAdminSession } from '@/lib/admin-session'
import { formatPrice } from '@/lib/ecommerce'

interface AdminProduct {
  id: number
  slug: string
  name: string
  description: string
  priceCents: number
  comparePriceCents: number | null
  currency: string
  stock: number
  unit: string | null
  weightGrams: number | null
  sku: string | null
  category: string
  imageUrl: string | null
  images: string[]
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
}

interface FormState {
  name: string
  description: string
  price: string
  comparePrice: string
  stock: string
  unit: string
  weightGrams: string
  sku: string
  category: string
  imageUrl: string
  isActive: boolean
  isFeatured: boolean
  sortOrder: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  stock: '0',
  unit: '',
  weightGrams: '',
  sku: '',
  category: 'Prodotti',
  imageUrl: '',
  isActive: true,
  isFeatured: false,
  sortOrder: '0',
}

/** Ridimensiona l'immagine nel browser: evita di salvare foto da 5 MB nel database. */
function resizeImage(file: File, maxSize = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lettura del file fallita'))
    reader.onload = () => {
      const img = new window.Image()
      img.onerror = () => reject(new Error('Immagine non valida'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas non disponibile'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export default function AdminEcommerce() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch {
      setError('Impossibile caricare i prodotti.')
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
        loadProducts()
      }
    })
    return () => {
      cancelled = true
    }
  }, [router, loadProducts])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (product: AdminProduct) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: (product.priceCents / 100).toFixed(2).replace('.', ','),
      comparePrice: product.comparePriceCents
        ? (product.comparePriceCents / 100).toFixed(2).replace('.', ',')
        : '',
      stock: String(product.stock),
      unit: product.unit ?? '',
      weightGrams: product.weightGrams ? String(product.weightGrams) : '',
      sku: product.sku ?? '',
      category: product.category,
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sortOrder: String(product.sortOrder),
    })
    setError('')
    setIsFormOpen(true)
  }

  const handleFile = async (file: File) => {
    setError('')
    try {
      const dataUrl = await resizeImage(file)
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }))
    } catch {
      setError('Non è stato possibile leggere l\'immagine.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)

    try {
      const response = await fetch(
        editingId ? `/api/admin/products/${editingId}` : '/api/admin/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || 'Salvataggio non riuscito.')
        return
      }

      setNotice(editingId ? 'Prodotto aggiornato.' : 'Prodotto creato.')
      setIsFormOpen(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      await loadProducts()
    } catch {
      setError('Errore di connessione.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Eliminare "${product.name}"?`)) return
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || 'Eliminazione non riuscita.')
        return
      }
      setNotice(data.message || 'Prodotto eliminato.')
      await loadProducts()
    } catch {
      setError('Errore di connessione.')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline"
          >
            <ArrowLeft size={20} />
            Pannello
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            E-commerce - Prodotti
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/ecommerce/ordini"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Receipt size={18} />
              Ordini
            </Link>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus size={18} />
              Nuovo prodotto
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded-lg mb-4">
            {notice}
          </div>
        )}
        {error && !isFormOpen && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Caricamento…</p>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-600 dark:text-gray-400">
            Nessun prodotto. Usa &laquo;Nuovo prodotto&raquo; per pubblicare il primo articolo
            in vetrina.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Prodotto</th>
                  <th className="px-4 py-3">Misura</th>
                  <th className="px-4 py-3">Prezzo</th>
                  <th className="px-4 py-3">Q.tà</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          {product.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {product.unit || '—'}
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.priceCents, product.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 0 ? 'text-red-600 dark:text-red-400' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'px-2 py-0.5 rounded-full text-xs font-medium ' +
                          (product.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300')
                        }
                      >
                        {product.isActive ? 'In vetrina' : 'Nascosto'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          aria-label="Modifica"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          aria-label="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center overflow-y-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Modifica prodotto' : 'Nuovo prodotto'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titolo *
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrizione
                </span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </label>

              <div className="grid md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prezzo (€) *
                  </span>
                  <input
                    required
                    inputMode="decimal"
                    placeholder="12,50"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prezzo barrato (€)
                  </span>
                  <input
                    inputMode="decimal"
                    placeholder="15,00"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantità disponibile
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Misura / formato
                  </span>
                  <input
                    placeholder="500 g, 75 cl, 1 kg…"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Peso (grammi)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.weightGrams}
                    onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Codice (SKU)
                  </span>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </span>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ordine in vetrina
                  </span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Immagine
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {form.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                      }}
                      className="block w-full text-sm text-gray-600 dark:text-gray-300"
                    />
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Rimuovi immagine
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Visibile in vetrina
                </label>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  In evidenza
                </label>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
                >
                  {isSaving ? 'Salvataggio…' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
