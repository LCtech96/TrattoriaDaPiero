import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/auth'

/**
 * Le API di scrittura erano pubbliche: chiunque conoscesse l'URL poteva
 * creare o cancellare post, VIP, immagini e prodotti. Qui blocchiamo ogni
 * metodo che modifica dati se non c'è una sessione admin valida.
 */
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** API pubbliche in scrittura per necessità (checkout cliente, webhook Stripe). */
const PUBLIC_WRITE_PATHS = [
  '/api/admin/login',
  '/api/admin/logout',
  '/api/checkout',
  '/api/webhooks/stripe',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const session = await verifySessionToken(token)

  // Pagine del pannello: redirect al login se non autenticato.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Login già effettuato: non ha senso restare sulla pagina di login.
  if (pathname === '/admin/login' && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/api/admin') && !PUBLIC_WRITE_PATHS.includes(pathname)) {
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (
    pathname.startsWith('/api/') &&
    WRITE_METHODS.has(request.method) &&
    !PUBLIC_WRITE_PATHS.includes(pathname)
  ) {
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
