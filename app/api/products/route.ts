import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedJson } from '@/lib/public-cache'

export const dynamic = 'force-dynamic'

/** Vetrina pubblica: solo i prodotti attivi, senza dati interni. */
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ products: [] })
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceCents: true,
        comparePriceCents: true,
        currency: true,
        stock: true,
        unit: true,
        category: true,
        imageUrl: true,
        images: true,
        isFeatured: true,
      },
    })

    return cachedJson({ products }, 'products')
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Errore nel recupero dei prodotti' }, { status: 500 })
  }
}
