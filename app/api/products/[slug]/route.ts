import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedJson } from '@/lib/public-cache'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
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

    if (!product) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 })
    }

    return cachedJson({ product }, 'products')
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Errore nel recupero del prodotto' }, { status: 500 })
  }
}
