import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedJson, purgePublicCache } from '@/lib/public-cache'
import { requireAdmin } from '@/lib/require-admin'
import { validateImage } from '@/lib/image-validation'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'

const TYPES = new Set(['cover', 'profile'])

// GET - Recupera le immagini generali (cover o profile)
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type')
    if (!type || !TYPES.has(type)) {
      return NextResponse.json({ error: 'Tipo immagine non valido. Usa "cover" o "profile"' }, { status: 400 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const content = await prisma.content.findUnique({
      where: { key: `${type}_image` },
      select: { value: true },
    })
    return cachedJson({ imageUrl: content?.value || null }, 'general-images')
  } catch (error) {
    console.error('Error fetching general image:', error)
    return NextResponse.json({ error: "Errore nel recupero dell'immagine" }, { status: 500 })
  }
}

// POST - Salva un'immagine generale (solo admin)
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json().catch(() => null)
    const type = body?.type
    if (typeof type !== 'string' || !TYPES.has(type)) {
      return NextResponse.json({ error: 'Tipo immagine non valido. Usa "cover" o "profile"' }, { status: 400 })
    }

    const image = validateImage(body?.imageUrl)
    if (!image.ok) {
      await logSecurityEvent('upload_rejected', request, `immagine ${type}: ${image.error}`)
      return NextResponse.json({ error: image.error }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const key = `${type}_image`
    const content = await prisma.content.upsert({
      where: { key },
      update: { value: image.value!, type: 'image' },
      create: { key, value: image.value!, type: 'image' },
      select: { key: true, value: true },
    })
    await purgePublicCache('general-images')

    return NextResponse.json({ success: true, imageUrl: content?.value })
  } catch (error) {
    console.error('Error saving general image:', error)
    return NextResponse.json({ error: "Errore nel salvataggio dell'immagine" }, { status: 500 })
  }
}
