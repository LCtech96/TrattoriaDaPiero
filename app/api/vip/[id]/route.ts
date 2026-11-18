import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { purgePublicCache } from '@/lib/public-cache'
import { requireAdmin } from '@/lib/require-admin'
import { optionalText, validateImage } from '@/lib/image-validation'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

// DELETE - Elimina un VIP (solo admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const id = parseId((await params).id)
    if (id === null) {
      return NextResponse.json({ error: 'ID VIP non valido' }, { status: 400 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    await prisma.vip.delete({ where: { id } })
    await purgePublicCache('vip')
    await logSecurityEvent('admin_delete', request, `vip ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting VIP:', error)
    return NextResponse.json({ error: "Errore nell'eliminazione del VIP" }, { status: 500 })
  }
}

// PUT - Aggiorna un VIP (solo admin)
export async function PUT(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const id = parseId((await params).id)
    if (id === null) {
      return NextResponse.json({ error: 'ID VIP non valido' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }

    const data: { imageUrl?: string; title?: string | null } = {}

    if (body.imageUrl !== undefined && body.imageUrl !== null && body.imageUrl !== '') {
      const image = validateImage(body.imageUrl)
      if (!image.ok) {
        await logSecurityEvent('upload_rejected', request, `vip ${id}: ${image.error}`)
        return NextResponse.json({ error: image.error }, { status: 400 })
      }
      data.imageUrl = image.value!
    }

    if (body.title !== undefined) {
      const title = optionalText(body.title, 200)
      if (!title.ok) {
        return NextResponse.json({ error: title.error }, { status: 400 })
      }
      data.title = title.value
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const vip = await prisma.vip.update({ where: { id }, data })
    await purgePublicCache('vip')
    return NextResponse.json(vip)
  } catch (error) {
    console.error('Error updating VIP:', error)
    return NextResponse.json({ error: "Errore nell'aggiornamento del VIP" }, { status: 500 })
  }
}
