import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isAdminConfigured,
  verifyPassword,
} from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rate limit in memoria: rallenta i tentativi a forza bruta sulla password.
// È per istanza serverless, quindi è una difesa parziale ma a costo zero.
const attempts = new Map<string, { count: number; firstAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10

function tooManyAttempts(ip: string): boolean {
  const entry = attempts.get(ip)
  if (!entry) return false
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string) {
  const entry = attempts.get(ip)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: Date.now() })
    return
  }
  entry.count += 1
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
      { status: 429 }
    )
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          'Login non configurato. Imposta ADMIN_EMAIL, ADMIN_PASSWORD_HASH e ADMIN_SESSION_SECRET.',
      },
      { status: 503 }
    )
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

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 400 })
  }

  const expectedEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase()
  const emailMatches = email.trim().toLowerCase() === expectedEmail
  // Verifichiamo comunque la password anche con email sbagliata, così i
  // tempi di risposta non rivelano se l'email esiste.
  const passwordMatches = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)

  if (!emailMatches || !passwordMatches) {
    recordAttempt(ip)
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
  }

  const token = await createSessionToken(expectedEmail)
  if (!token) {
    return NextResponse.json({ error: 'Sessione non configurata' }, { status: 503 })
  }

  attempts.delete(ip)

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
