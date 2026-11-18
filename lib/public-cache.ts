import { NextResponse } from 'next/server'
import { dangerouslyDeleteByTag } from '@vercel/functions'

/**
 * Cache sulla rete di Vercel per le API pubbliche (foto, post, VIP, prodotti).
 *
 * Le foto sono salvate nel database come base64 da diversi MB: senza cache ogni
 * visita rifaceva quel lavoro sul server, ed era la voce che consumava il CPU di
 * Vercel fino a far sospendere l'account. Ora la rete di Vercel tiene la risposta
 * per un'ora e la funzione parte solo quando la copia scade. Quando l'admin
 * modifica qualcosa, purgePublicCache svuota subito la cache di quella sezione.
 */
const CDN_CACHE = 'public, max-age=3600, stale-while-revalidate=86400'

export type PublicCacheTag = 'general-images' | 'menu-images' | 'posts' | 'vip' | 'products'

/** Risposta JSON pubblica, tenuta in cache sulla rete di Vercel. Solo per risposte riuscite. */
export function cachedJson(data: unknown, tag: PublicCacheTag) {
  return NextResponse.json(data, {
    headers: {
      'Vercel-CDN-Cache-Control': CDN_CACHE,
      // Il browser ricontrolla ogni volta con la rete di Vercel (risposta veloce, niente funzione).
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Vercel-Cache-Tag': tag,
    },
  })
}

/**
 * Svuota la cache delle sezioni indicate dopo una modifica dell'admin, così la
 * prossima richiesta legge i dati nuovi. Se non riesce, i dati si aggiornano
 * comunque entro un'ora: l'errore non deve far fallire il salvataggio.
 */
export async function purgePublicCache(...tags: PublicCacheTag[]) {
  try {
    await dangerouslyDeleteByTag(tags)
  } catch (error) {
    console.error('Svuotamento della cache non riuscito (i dati si aggiornano entro un\'ora):', error)
  }
}
