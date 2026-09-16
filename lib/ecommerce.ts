/** Utilità condivise dell'e-commerce. I prezzi sono sempre in centesimi. */

export function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(cents / 100)
}

/** Converte un prezzo scritto dall'admin ("12,50" o "12.50") in centesimi. */
export function parsePriceToCents(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 100) : null
  }
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number.parseFloat(normalized) * 100)
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function generateOrderNumber(): string {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `TDP-${stamp}-${random}`
}

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled', 'refunded'] as const
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const
export const PAYMENT_METHODS = ['stripe', 'contanti', 'bonifico', 'pos'] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'In attesa',
  paid: 'Pagato',
  shipped: 'Spedito',
  cancelled: 'Annullato',
  refunded: 'Rimborsato',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Da incassare',
  paid: 'Incassato',
  failed: 'Fallito',
  refunded: 'Rimborsato',
}

export interface PublicProduct {
  id: number
  slug: string
  name: string
  description: string
  priceCents: number
  comparePriceCents: number | null
  currency: string
  stock: number
  unit: string | null
  category: string
  imageUrl: string | null
  images: string[]
  isFeatured: boolean
}
