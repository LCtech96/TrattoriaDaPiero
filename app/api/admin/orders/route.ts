import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const status = request.nextUrl.searchParams.get('status')
    const where = status && status !== 'tutti' ? { status } : {}

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        items: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
    })

    // Riepilogo incassi: somma solo i pagamenti effettivamente riusciti.
    const succeeded = await prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amountCents: true },
      _count: true,
    })
    const pendingOrders = await prisma.order.count({ where: { paymentStatus: 'pending' } })

    return NextResponse.json({
      orders,
      summary: {
        totalCollectedCents: succeeded._sum.amountCents ?? 0,
        paymentsCount: succeeded._count,
        pendingOrders,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Errore nel recupero degli ordini' }, { status: 500 })
  }
}
