import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'
import { validateImage } from '@/lib/image-validation'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'

type Params = { params: Promise<{ itemId: string }> }

function parseItemId(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 && id < 1_000_000 ? id : null
}

// GET - Recupera l'immagine di un piatto
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const itemId = parseItemId((await params).itemId)
    if (itemId === null) {
      return NextResponse.json({ error: 'ID menu item non valido' }, { status: 400 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { imageUrl: true },
    })
    if (menuItem?.imageUrl) {
      return NextResponse.json({ imageUrl: menuItem.imageUrl })
    }

    const content = await prisma.content.findUnique({
      where: { key: `menu_item_image_${itemId}` },
      select: { value: true },
    })
    return NextResponse.json({ imageUrl: content?.value || null })
  } catch (error) {
    console.error('Error fetching menu item image:', error)
    return NextResponse.json({ error: "Errore nel recupero dell'immagine" }, { status: 500 })
  }
}

// POST - Salva l'immagine di un piatto (solo admin)
export async function POST(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const itemId = parseItemId((await params).itemId)
    if (itemId === null) {
      return NextResponse.json({ error: 'ID menu item non valido' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const image = validateImage(body?.imageUrl)
    if (!image.ok) {
      await logSecurityEvent('upload_rejected', request, `piatto ${itemId}: ${image.error}`)
      return NextResponse.json({ error: image.error }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const existingItem = await prisma.menuItem.findUnique({ where: { id: itemId } })
    if (!existingItem) {
      // Il menù è statico (data/menu-data.ts): l'immagine si salva in Content.
      const key = `menu_item_image_${itemId}`
      const content = await prisma.content.upsert({
        where: { key },
        update: { value: image.value!, type: 'image' },
        create: { key, value: image.value!, type: 'image' },
        select: { key: true, value: true },
      })
      return NextResponse.json({ success: true, imageUrl: content.value })
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: { imageUrl: image.value },
      select: { id: true, imageUrl: true },
    })
    return NextResponse.json({ success: true, imageUrl: updatedItem?.imageUrl })
  } catch (error) {
    console.error('Error saving menu item image:', error)
    return NextResponse.json({ error: "Errore nel salvataggio dell'immagine" }, { status: 500 })
  }
}
