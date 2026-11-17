import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isAdminConfigured,
  verifyPassword,
} from '@/lib/auth'
import { getClientIp, logSecurityEvent, rateLimit, rateLimitPeek, rateLimitReset } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Per IP: 10 tentativi ogni 15 minuti.
const IP_LIMIT = 10
const IP_WINDOW_SECONDS = 15 * 60
// Globale: oltre 50 tentativi falliti in un'ora (anche da IP diversi) il login
// si blocca per tutti fino alla fine della finestra. Ferma gli attacchi
// distribuiti; nel peggiore dei casi l'admin aspetta qualche minuto.
const GLOBAL_FAIL_LIMIT = 50
const GLOBAL_WINDOW_SECONDS = 60 * 60
const GLOBAL_KEY = 'login:fail:global'

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ipKey = `login:ip:${ip}`

  const perIp = await rateLimit(ipKey, IP_LIMIT, IP_WINDOW_SECONDS)
  if (!perIp.allowed) {
    // Si registra solo il primo blocco della finestra, per non riempire il registro.
    if (perIp.count === IP_LIMIT + 1) await logSecurityEvent('login_rate_limited', request)
    return tooMany(perIp.retryAfter)
  }

  if ((await rateLimitPeek(GLOBAL_KEY, GLOBAL_WINDOW_SECONDS)) >= GLOBAL_FAIL_LIMIT) {
    await logSecurityEvent('login_locked', request, 'Troppi tentativi falliti nell\'ultima ora: login sospeso')
    return tooMany(GLOBAL_WINDOW_SECONDS)
  }

  if (!isAdminConfigured()) {
    console.error('Login admin non configurato: mancano ADMIN_EMAIL, ADMIN_PASSWORD_HASH o ADMIN_SESSION_SECRET')
    return NextResponse.json({ error: 'Accesso temporaneamente non disponibile' }, { status: 503 })
  }

  let email: unknown
  let password: unknown
  try {
    const body = await request.json()
    email = body?.email
    password = body?.password
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }

  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 256) {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 400 })
  }

  const expectedEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase()
  const emailMatches = email.trim().toLowerCase() === expectedEmail
  // Verifichiamo comunque la password anche con email sbagliata, così i
  // tempi di risposta non rivelano se l'email esiste.
  const passwordMatches = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)

  if (!emailMatches || !passwordMatches) {
    await rateLimit(GLOBAL_KEY, GLOBAL_FAIL_LIMIT, GLOBAL_WINDOW_SECONDS)
    await logSecurityEvent('login_failed', request, `email tentata: ${email.trim().slice(0, 80)}`)
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
  }

  const token = await createSessionToken(expectedEmail)
  if (!token) {
    console.error('Sessione admin non configurata: ADMIN_SESSION_SECRET mancante o troppo corto')
    return NextResponse.json({ error: 'Accesso temporaneamente non disponibile' }, { status: 503 })
  }

  await rateLimitReset(ipKey)
  await logSecurityEvent('login_success', request)

  const response = NextResponse.json({ success: true, email: expectedEmail })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}
