/**
 * Autenticazione admin.
 *
 * Le credenziali non stanno nel codice: l'email è in ADMIN_EMAIL e la
 * password è salvata solo come hash PBKDF2 in ADMIN_PASSWORD_HASH.
 * La sessione è un token firmato HMAC salvato in un cookie httpOnly, così
 * non è leggibile né falsificabile dal browser.
 *
 * Usa solo Web Crypto (crypto.subtle), disponibile sia nel runtime Node
 * delle route API sia nel runtime Edge del middleware.
 */

export const ADMIN_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 ore
const PBKDF2_ITERATIONS = 210_000

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of Array.from(bytes)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

/** Confronto a tempo costante: non rivela quanti caratteri combaciano. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256
  )
  return new Uint8Array(bits)
}

/** Genera un hash da salvare in ADMIN_PASSWORD_HASH. Usato da scripts/hash-password.mjs. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(derived)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number.parseInt(parts[1], 10)
  if (!Number.isFinite(iterations) || iterations < 1000) return false
  try {
    const derived = await pbkdf2(password, fromBase64Url(parts[2]), iterations)
    return timingSafeEqual(derived, fromBase64Url(parts[3]))
  } catch {
    return false
  }
}

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET
  // Un segreto corto rende il token forzabile: meglio rifiutare del tutto.
  if (!secret || secret.length < 32) return null
  return secret
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return toBase64Url(new Uint8Array(signature))
}

export async function createSessionToken(email: string): Promise<string | null> {
  const secret = getSessionSecret()
  if (!secret) return null
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
  )
  return `${payload}.${await sign(payload, secret)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null
  const secret = getSessionSecret()
  if (!secret) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = await sign(payload, secret)
  if (!timingSafeEqual(encoder.encode(signature), encoder.encode(expected))) return null

  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)))
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null
    if (typeof data.email !== 'string') return null
    return { email: data.email }
  } catch {
    return null
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS

/** true quando le variabili d'ambiente necessarie al login sono configurate. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && getSessionSecret())
}
