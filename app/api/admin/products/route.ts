import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseProductInput } from '@/lib/product-input'

export const dynamic = 'force-dynamic'

// L'accesso è già filtrato dal middleware: qui arriva solo l'admin autenticato.

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }
    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products (admin):', error)
    return NextResponse.json({ error: 'Errore nel recupero dei prodotti' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }

    const parsed = parseProductInput(body as Record<string, unknown>)
    if (parsed.error || !parsed.data) {
      return NextResponse.json({ error: parsed.error ?? 'Dati non validi' }, { status: 400 })
    }
    const productData = parsed.data

    // Lo slug fa parte dell'URL pubblico e deve essere unico.
    let slug = productData.slug || 'prodotto'
    for (let attempt = 1; attempt <= 20; attempt++) {
      const existing = await prisma.product.findUnique({ where: { slug } })
      if (!existing) break
      slug = `${productData.slug}-${attempt + 1}`
    }

    const product = await prisma.product.create({
      data: { ...productData, slug },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Errore nella creazione del prodotto' }, { status: 500 })
  }
}
