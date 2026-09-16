import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseProductInput } from '@/lib/product-input'

export const dynamic = 'force-dynamic'

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const id = parseId(params.id)
    if (id === null) {
      return NextResponse.json({ error: 'ID prodotto non valido' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }

    const parsed = parseProductInput(body as Record<string, unknown>, { partial: true })
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 })
    }

    // Se lo slug generato è già di un altro prodotto lo lasciamo invariato,
    // così un rename non rompe silenziosamente l'URL di un altro prodotto.
    const data = { ...parsed.data }
    if (data.slug && data.slug !== existing.slug) {
      const clash = await prisma.product.findUnique({ where: { slug: data.slug } })
      if (clash) data.slug = `${data.slug}-${id}`
    }

    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Errore nell\'aggiornamento del prodotto' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const id = parseId(params.id)
    if (id === null) {
      return NextResponse.json({ error: 'ID prodotto non valido' }, { status: 400 })
    }

    const orderItems = await prisma.orderItem.count({ where: { productId: id } })
    if (orderItems > 0) {
      // Il prodotto compare in ordini già registrati: disattivarlo lo toglie
      // dalla vetrina senza cancellare lo storico delle vendite.
      await prisma.product.update({ where: { id }, data: { isActive: false } })
      return NextResponse.json({
        success: true,
        archived: true,
        message:
          'Il prodotto compare in ordini già registrati: è stato disattivato e tolto dalla vetrina invece di essere eliminato.',
      })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true, archived: false })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Errore nell\'eliminazione del prodotto' }, { status: 500 })
  }
}
