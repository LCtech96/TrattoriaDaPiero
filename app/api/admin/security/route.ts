import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { getSecuritySummary } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Registro degli eventi di sicurezza per il pannello admin. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const summary = await getSecuritySummary()
    if (!summary) {
      return NextResponse.json({ error: 'Registro non disponibile' }, { status: 503 })
    }
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error loading security log:', error)
    return NextResponse.json({ error: 'Errore nel caricamento del registro' }, { status: 500 })
  }
}
