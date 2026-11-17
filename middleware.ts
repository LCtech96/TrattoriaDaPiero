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

/** Chiamate server-to-server senza browser: non hanno un'origine da controllare. */
const NO_ORIGIN_CHECK_PATHS = ['/api/webhooks/stripe']

/**
 * Protezione CSRF: una richiesta che modifica dati deve partire dal nostro
 * stesso sito. I browser aggiungono sempre l'header Origin alle POST/PUT/
 * PATCH/DELETE (e Sec-Fetch-Site), e una pagina esterna non può falsificarli.
 * Si somma al cookie SameSite=Lax.
 */
function isCrossSite(request: NextRequest): boolean {
  const host = request.headers.get('host') ?? request.nextUrl.host
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      return new URL(origin).host !== host
    } catch {
      return true
    }
  }
  return request.headers.get('sec-fetch-site') === 'cross-site'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api/') &&
    WRITE_METHODS.has(request.method) &&
    !NO_ORIGIN_CHECK_PATHS.includes(pathname) &&
    isCrossSite(request)
  ) {
    console.warn(
      JSON.stringify({
        security: 'csrf_blocked',
        path: pathname,
        origin: request.headers.get('origin'),
        at: new Date().toISOString(),
      })
    )
    return NextResponse.json({ error: 'Origine della richiesta non consentita' }, { status: 403 })
  }

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

  // /api/admin/session dice solo "sei loggato sì/no": è pubblica.
  if (
    pathname.startsWith('/api/admin') &&
    !PUBLIC_WRITE_PATHS.includes(pathname) &&
    pathname !== '/api/admin/session'
  ) {
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
