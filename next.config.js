/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trattoriadapieromondello.site').replace(/\/$/, '')

// Content-Security-Policy: il sito carica script, stili e font solo da sé
// stesso. 'unsafe-inline' sugli script serve a Next.js (dati di idratazione
// inline) e allo script del tema; senza nonce non si può togliere.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Mappa di Google incorporata nella home e in /maps
  'frame-src https://www.google.com https://maps.google.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Vercel di default risponde "*": si restringe al dominio del sito.
  { key: 'Access-Control-Allow-Origin', value: siteUrl },
]

const nextConfig = {
  poweredByHeader: false,
  images: {
    // Solo immagini del sito (cartella public/). Prima remotePatterns '**'
    // trasformava l'ottimizzatore in un proxy aperto verso qualunque sito.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
