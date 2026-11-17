import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/auth'

/**
 * Secondo controllo della sessione admin dentro le route, oltre al middleware:
 * se un giorno il middleware venisse aggirato (è già successo con bug di
 * Next.js) le API restano comunque chiuse.
 * Restituisce una risposta 401 da ritornare subito, oppure null se è tutto ok.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  return null
}
