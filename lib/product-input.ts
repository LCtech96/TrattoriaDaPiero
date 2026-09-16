import { parsePriceToCents, slugify } from '@/lib/ecommerce'

export interface ProductInput {
  name: string
  slug: string
  description: string
  priceCents: number
  comparePriceCents: number | null
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

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asOptionalString(value: unknown): string | null {
  const text = asString(value)
  return text.length > 0 ? text : null
}

function asInteger(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value.trim(), 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

/**
 * Valida e normalizza i dati inviati dal pannello admin.
 * `partial` è true sugli aggiornamenti: i campi assenti restano invariati.
 */
export function parseProductInput(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {}
): { data: Partial<ProductInput>; error?: undefined } | { data?: undefined; error: string } {
  const data: Partial<ProductInput> = {}

  if (!partial || body.name !== undefined) {
    const name = asString(body.name)
    if (name.length < 2) return { error: 'Il titolo del prodotto è obbligatorio (minimo 2 caratteri)' }
    if (name.length > 200) return { error: 'Il titolo non può superare i 200 caratteri' }
    data.name = name
  }

  if (!partial || body.slug !== undefined || body.name !== undefined) {
    const slug = slugify(asString(body.slug) || asString(body.name) || data.name || '')
    if (slug) data.slug = slug
  }

  if (!partial || body.description !== undefined) {
    const description = asString(body.description)
    if (description.length > 5000) return { error: 'La descrizione non può superare i 5000 caratteri' }
    data.description = description
  }

  if (!partial || body.price !== undefined || body.priceCents !== undefined) {
    const raw = body.price !== undefined ? body.price : body.priceCents
    const cents =
      body.priceCents !== undefined && body.price === undefined
        ? asInteger(body.priceCents, -1)
        : parsePriceToCents(raw as string | number)
    if (cents === null || cents < 0) return { error: 'Prezzo non valido (es. 12,50)' }
    if (cents > 100_000_00) return { error: 'Prezzo troppo alto' }
    data.priceCents = cents
  }

  if (!partial || body.comparePrice !== undefined) {
    const raw = asString(body.comparePrice)
    if (raw === '') {
      data.comparePriceCents = null
    } else {
      const cents = parsePriceToCents(raw)
      if (cents === null || cents < 0) return { error: 'Prezzo barrato non valido' }
      data.comparePriceCents = cents
    }
  }

  if (!partial || body.stock !== undefined) {
    const stock = asInteger(body.stock, 0)
    if (stock < 0) return { error: 'La quantità non può essere negativa' }
    data.stock = stock
  }

  if (!partial || body.unit !== undefined) data.unit = asOptionalString(body.unit)
  if (!partial || body.sku !== undefined) data.sku = asOptionalString(body.sku)

  if (!partial || body.weightGrams !== undefined) {
    const raw = asString(body.weightGrams)
    if (raw === '') {
      data.weightGrams = null
    } else {
      const grams = asInteger(body.weightGrams, -1)
      if (grams < 0) return { error: 'Peso non valido' }
      data.weightGrams = grams
    }
  }

  if (!partial || body.category !== undefined) {
    data.category = asString(body.category) || 'Prodotti'
  }

  if (!partial || body.imageUrl !== undefined) data.imageUrl = asOptionalString(body.imageUrl)

  if (!partial || body.images !== undefined) {
    const images = Array.isArray(body.images)
      ? body.images.filter((img): img is string => typeof img === 'string' && img.trim() !== '')
      : []
    data.images = images
  }

  if (!partial || body.isActive !== undefined) data.isActive = body.isActive !== false
  if (!partial || body.isFeatured !== undefined) data.isFeatured = body.isFeatured === true
  if (!partial || body.sortOrder !== undefined) data.sortOrder = asInteger(body.sortOrder, 0)

  return { data }
}
