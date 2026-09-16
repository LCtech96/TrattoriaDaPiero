import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
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

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Errore nel recupero del prodotto' }, { status: 500 })
  }
}
