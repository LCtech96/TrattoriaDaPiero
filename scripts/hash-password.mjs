#!/usr/bin/env node
/**
 * Genera il valore da mettere in ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.mjs 'la-tua-password'
 *
 * Stampa anche un ADMIN_SESSION_SECRET casuale. La password in chiaro non
 * viene mai salvata su disco: copia solo l'hash nelle variabili d'ambiente.
 */
import { webcrypto as crypto } from 'node:crypto'

const PBKDF2_ITERATIONS = 210_000
const encoder = new TextEncoder()

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString('base64url')
}

const password = process.argv[2]
if (!password) {
  console.error("Uso: node scripts/hash-password.mjs 'la-tua-password'")
  process.exit(1)
}

const salt = crypto.getRandomValues(new Uint8Array(16))
const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
  'deriveBits',
])
const bits = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
  key,
  256
)

console.log('ADMIN_PASSWORD_HASH=' + `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`)
console.log('ADMIN_SESSION_SECRET=' + toBase64Url(crypto.getRandomValues(new Uint8Array(48))))
