import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/ecommerce'
import { getSiteUrl, getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestItem {
  productId: number
  quantity: number
}

function shippingCents(subtotal: number): number {
  const flat = Number.parseInt(process.env.SHOP_SHIPPING_CENTS ?? '0', 10)
  const freeOver = Number.parseInt(process.env.SHOP_FREE_SHIPPING_OVER_CENTS ?? '0', 10)
  if (!Number.isFinite(flat) || flat <= 0) return 0
  if (Number.isFinite(freeOver) && freeOver > 0 && subtotal >= freeOver) return 0
  return flat
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

    const customerName = String(body.customerName ?? '').trim()
    const customerEmail = String(body.customerEmail ?? '').trim()
    const customerPhone = String(body.customerPhone ?? '').trim()
    const shippingAddress = String(body.shippingAddress ?? '').trim()
    const notes = String(body.notes ?? '').trim().slice(0, 1000)

    if (customerName.length < 2) {
      return NextResponse.json({ error: 'Inserisci nome e cognome' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Inserisci un indirizzo email valido' }, { status: 400 })
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    const items: RequestItem[] = []
    for (const raw of rawItems) {
      const productId = Number.parseInt(String(raw?.productId), 10)
      const quantity = Number.parseInt(String(raw?.quantity), 10)
      if (!Number.isFinite(productId) || productId <= 0) continue
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 99) continue
      items.push({ productId, quantity })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Il carrello è vuoto' }, { status: 400 })
    }

    // I prezzi vengono sempre riletti dal database: il client potrebbe
    // inviare importi manomessi.
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((item) => item.productId) }, isActive: true },
    })
    const byId = new Map<number, (typeof products)[number]>(
      products.map((product: (typeof products)[number]) => [product.id, product])
    )

    const orderItems = []
    let subtotalCents = 0

    for (const item of items) {
      const product = byId.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: 'Uno dei prodotti non è più disponibile. Aggiorna il carrello.' },
          { status: 409 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Disponibilità insufficiente per "${product.name}": restano ${product.stock} pezzi.`,
          },
          { status: 409 }
        )
      }
      const totalCents = product.priceCents * item.quantity
      subtotalCents += totalCents
      orderItems.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
        totalCents,
      })
    }

    const shipping = shippingCents(subtotalCents)
    const totalCents = subtotalCents + shipping

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        notes: notes || null,
        subtotalCents,
        shippingCents: shipping,
        totalCents,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    const stripe = getStripe()
    if (!stripe) {
      // Senza chiavi Stripe l'ordine resta registrato come "da incassare":
      // l'admin lo vede nel pannello e concorda il pagamento col cliente.
      return NextResponse.json({
        orderNumber: order.orderNumber,
        checkoutUrl: null,
        message:
          'Ordine registrato. I pagamenti online non sono ancora attivi: ti contatteremo per completare il pagamento.',
      })
    }

    const siteUrl = getSiteUrl(request)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: order.orderNumber,
      metadata: { orderNumber: order.orderNumber, orderId: String(order.id) },
      line_items: [
        ...order.items.map((item: (typeof order.items)[number]) => ({
          quantity: item.quantity,
          price_data: {
            currency: 'eur',
            unit_amount: item.unitPriceCents,
            product_data: {
              name: item.unit ? `${item.name} (${item.unit})` : item.name,
            },
          },
        })),
        ...(shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: 'eur',
                  unit_amount: shipping,
                  product_data: { name: 'Spedizione' },
                },
              },
            ]
          : []),
      ],
      success_url: `${siteUrl}/ecommerce/ordine?numero=${order.orderNumber}&esito=ok`,
      cancel_url: `${siteUrl}/ecommerce/carrello?annullato=1`,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id, paymentMethod: 'stripe' },
    })

    return NextResponse.json({ orderNumber: order.orderNumber, checkoutUrl: session.url })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Errore durante il checkout' }, { status: 500 })
  }
}
