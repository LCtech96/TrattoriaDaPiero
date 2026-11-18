import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { purgePublicCache } from '@/lib/public-cache'
import { getStripe } from '@/lib/stripe'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Webhook Stripe: è l'unica fonte attendibile per marcare un ordine come
 * pagato. La pagina di ritorno del browser non basta, perché chiunque può
 * aprirne l'URL. La firma viene sempre verificata con STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook non configurato' }, { status: 503 })
  }
  if (!prisma) {
    return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    await logSecurityEvent('webhook_bad_signature', request, 'firma mancante')
    return NextResponse.json({ error: 'Firma mancante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const payload = await request.text()
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    await logSecurityEvent('webhook_bad_signature', request, 'firma non valida')
    return NextResponse.json({ error: 'Firma non valida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'paid') {
          await markOrderPaid(session, request)
        }
        break
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        await prisma.order.updateMany({
          where: { stripeSessionId: session.id },
          data: { paymentStatus: 'failed' },
        })
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const intentId =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
        if (intentId) {
          await prisma.order.updateMany({
            where: { stripePaymentIntentId: intentId },
            data: { paymentStatus: 'refunded', status: 'refunded' },
          })
        }
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function markOrderPaid(session: Stripe.Checkout.Session, request: Request) {
  const order = await prisma!.order.findFirst({
    where: session.id
      ? { stripeSessionId: session.id }
      : { orderNumber: session.metadata?.orderNumber ?? '' },
    include: { items: true },
  })

  if (!order) {
    console.error('Stripe webhook: ordine non trovato per la sessione', session.id)
    return
  }

  // L'importo incassato deve coincidere con il totale calcolato dal server.
  // Se non coincide l'ordine NON viene segnato come pagato: va controllato a mano.
  const currency = (session.currency ?? 'eur').toUpperCase()
  if (session.amount_total !== order.totalCents || currency !== String(order.currency ?? 'EUR').toUpperCase()) {
    await logSecurityEvent(
      'payment_amount_mismatch',
      request,
      `ordine ${order.orderNumber}: pagati ${((session.amount_total ?? 0) / 100).toFixed(2)} ${currency}, attesi ${(order.totalCents / 100).toFixed(2)} ${order.currency}`
    )
    return
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  const providerRef = paymentIntentId ?? session.id

  await prisma!.$transaction(async (tx: any) => {
    // Stripe può inviare lo stesso evento più volte: il pagamento si registra
    // una sola volta per riferimento (controllo dentro la transazione).
    const alreadyRecorded = await tx.payment.findFirst({
      where: { orderId: order.id, provider: 'stripe', providerRef },
    })
    if (!alreadyRecorded) {
      await tx.payment.create({
        data: {
          orderId: order.id,
          amountCents: session.amount_total ?? order.totalCents,
          currency,
          provider: 'stripe',
          providerRef,
          status: 'succeeded',
        },
      })
    }

    // Lo stock si scala una volta sola, protetti dal flag stockApplied.
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
        status: order.status === 'pending' ? 'paid' : order.status,
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
        stockApplied: true,
        paidAt: order.paidAt ?? new Date(),
      },
    })
  })
  // Il magazzino è cambiato: la vetrina deve mostrare le nuove disponibilità.
  await purgePublicCache('products')
}
