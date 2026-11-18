import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedJson } from '@/lib/public-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Elenco dei piatti che hanno una foto. Il menù lo chiede una volta sola e poi
 * scarica solo le foto esistenti, invece di fare una richiesta per ognuno degli
 * ~80 piatti (che sovraccaricava il database e dava errori 500).
 */
export async function GET() {
  try {
    if (!prisma) return NextResponse.json({ ids: [] })

    const [fromContent, fromMenu] = await Promise.all([
      prisma.content.findMany({
        where: { key: { startsWith: 'menu_item_image_' }, NOT: { value: '' } },
        select: { key: true },
      }),
      prisma.menuItem.findMany({ where: { imageUrl: { not: null } }, select: { id: true } }),
    ])

    const ids = new Set<number>()
    for (const row of fromContent as { key: string }[]) {
      const id = Number.parseInt(row.key.replace('menu_item_image_', ''), 10)
      if (Number.isFinite(id)) ids.add(id)
    }
    for (const row of fromMenu as { id: number }[]) ids.add(row.id)

    return cachedJson({ ids: Array.from(ids) }, 'menu-images')
  } catch (error) {
    console.error('Error listing menu item images:', error)
    return NextResponse.json({ ids: [] }, { status: 500 })
  }
}
