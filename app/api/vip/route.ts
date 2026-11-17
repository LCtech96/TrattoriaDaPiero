import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'
import { optionalText, validateImage } from '@/lib/image-validation'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'

// GET - Elenco VIP (pubblico)
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }
    const vips = await prisma.vip.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return NextResponse.json(vips)
  } catch (error) {
    console.error('Error fetching VIPs:', error)
    return NextResponse.json({ error: 'Errore nel recupero dei VIP' }, { status: 500 })
  }
}

// POST - Crea un VIP (solo admin)
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json().catch(() => null)

    const image = validateImage(body?.imageUrl)
    if (!image.ok) {
      await logSecurityEvent('upload_rejected', request, `vip: ${image.error}`)
      return NextResponse.json({ error: image.error }, { status: 400 })
    }

    const title = optionalText(body?.title, 200)
    if (!title.ok) {
      return NextResponse.json({ error: title.error }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const vip = await prisma.vip.create({ data: { imageUrl: image.value!, title: title.value } })
    return NextResponse.json(vip)
  } catch (error) {
    console.error('Error creating VIP:', error)
    return NextResponse.json({ error: 'Errore nella creazione del VIP' }, { status: 500 })
  }
}
