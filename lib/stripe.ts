import Stripe from 'stripe'

/**
 * Client Stripe creato solo se la chiave segreta è configurata: senza chiavi
 * il resto del sito continua a funzionare e il checkout mostra un messaggio
 * invece di andare in errore 500.
 */
let cached: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!cached) {
    cached = new Stripe(key, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion })
  }
  return cached
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** URL pubblico del sito, usato per le pagine di ritorno da Stripe. */
export function getSiteUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (request) {
    const origin = request.headers.get('origin')
    if (origin) return origin.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}
