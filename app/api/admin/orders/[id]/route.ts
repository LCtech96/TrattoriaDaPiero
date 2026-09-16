import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ORDER_STATUSES, PAYMENT_METHODS, parsePriceToCents } from '@/lib/ecommerce'

export const dynamic = 'force-dynamic'

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

/** Aggiorna lo stato dell'ordine e/o registra un incasso manuale. */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const id = parseId(params.id)
    if (id === null) {
      return NextResponse.json({ error: 'ID ordine non valido' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body.status === 'string') {
      if (!(ORDER_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: 'Stato ordine non valido' }, { status: 400 })
      }
      data.status = body.status
    }

    if (body.payment) {
      const method = String(body.payment.method ?? '')
      if (!(PAYMENT_METHODS as readonly string[]).includes(method)) {
        return NextResponse.json({ error: 'Metodo di pagamento non valido' }, { status: 400 })
      }

      // Se non viene indicato un importo si registra il totale dell'ordine.
      const amountRaw = String(body.payment.amount ?? '').trim()
      const amountCents = amountRaw === '' ? order.totalCents : parsePriceToCents(amountRaw)
      if (amountCents === null || amountCents <= 0) {
        return NextResponse.json({ error: 'Importo non valido' }, { status: 400 })
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.payment.create({
          data: {
            orderId: order.id,
            amountCents,
            currency: order.currency,
            provider: method,
            providerRef: String(body.payment.reference ?? '').trim() || null,
            notes: String(body.payment.notes ?? '').trim() || null,
            status: 'succeeded',
          },
        })

        // L'incasso manuale scala il magazzino come farebbe un pagamento
        // Stripe, ma una sola volta per ordine.
        if (!order.stockApplied) {
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              })
            }
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            ...data,
            status: typeof data.status === 'string' ? data.status : 'paid',
            paymentStatus: 'paid',
            paymentMethod: method,
            stockApplied: true,
            paidAt: order.paidAt ?? new Date(),
          },
        })
      })
    } else if (Object.keys(data).length > 0) {
      await prisma.order.update({ where: { id }, data })
    } else {
      return NextResponse.json({ error: 'Nessuna modifica richiesta' }, { status: 400 })
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: { orderBy: { paidAt: 'desc' } } },
    })
    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Errore nell\'aggiornamento dell\'ordine' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const id = parseId(params.id)
    if (id === null) {
      return NextResponse.json({ error: 'ID ordine non valido' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }
    if (order.paymentStatus === 'paid') {
      // Un ordine incassato è un documento contabile: si annulla, non si cancella.
      return NextResponse.json(
        { error: 'Un ordine già pagato non può essere eliminato: impostalo su "Rimborsato".' },
        { status: 409 }
      )
    }

    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Errore nell\'eliminazione dell\'ordine' }, { status: 500 })
  }
}
