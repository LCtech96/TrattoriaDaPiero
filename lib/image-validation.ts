/**
 * Validazione lato server delle immagini inviate dal pannello admin.
 *
 * Il browser manda le immagini come data URL base64. Qui si controlla:
 *  - il tipo dichiarato (solo PNG, JPEG, WebP, GIF, AVIF: niente SVG, che può
 *    contenere script);
 *  - il peso reale dopo la decodifica;
 *  - il contenuto reale: i primi byte devono corrispondere al tipo dichiarato.
 * Sono ammessi anche percorsi locali del sito ("/copertina.png") e URL https.
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB

type Check = (bytes: Uint8Array) => boolean

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, i) => bytes[offset + i] === value)

const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0))

const SIGNATURES: Record<string, Check> = {
  'image/png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/jpg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/gif': (b) => startsWith(b, ascii('GIF87a')) || startsWith(b, ascii('GIF89a')),
  'image/webp': (b) => startsWith(b, ascii('RIFF')) && startsWith(b, ascii('WEBP'), 8),
  'image/avif': (b) => startsWith(b, ascii('ftyp'), 4) && (startsWith(b, ascii('avif'), 8) || startsWith(b, ascii('avis'), 8)),
}

const DATA_URL = /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/]+={0,2})$/i
const LOCAL_PATH = /^\/(?!\/)[A-Za-z0-9._\-/]{1,200}$/

export type ImageCheck = { ok: true; value: string | null } | { ok: false; error: string }

export function validateImage(value: unknown, { optional = false } = {}): ImageCheck {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return optional ? { ok: true, value: null } : { ok: false, error: 'Immagine mancante' }
  }
  if (typeof value !== 'string') return { ok: false, error: 'Immagine non valida' }

  const input = value.trim()

  if (LOCAL_PATH.test(input) && !input.includes('..')) return { ok: true, value: input }

  if (/^https:\/\//i.test(input)) {
    try {
      const url = new URL(input)
      if (url.protocol === 'https:' && input.length <= 2048) return { ok: true, value: url.toString() }
    } catch {
      // cade nell'errore sotto
    }
    return { ok: false, error: 'URL immagine non valido' }
  }

  const match = DATA_URL.exec(input.replace(/\s/g, ''))
  if (!match) {
    return { ok: false, error: 'Formato immagine non supportato (usa JPG, PNG, WebP, GIF o AVIF)' }
  }

  const mime = match[1].toLowerCase()
  const check = SIGNATURES[mime]
  if (!check) {
    return { ok: false, error: 'Formato immagine non supportato (usa JPG, PNG, WebP, GIF o AVIF)' }
  }

  const base64 = match[2]
  const approxBytes = Math.floor((base64.length * 3) / 4)
  if (approxBytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Immagine troppo pesante (massimo 4 MB)' }
  }

  const bytes = Buffer.from(base64, 'base64')
  if (bytes.length < 16 || !check(bytes)) {
    return { ok: false, error: 'Il contenuto del file non corrisponde a un\'immagine valida' }
  }

  return { ok: true, value: `data:${mime === 'image/jpg' ? 'image/jpeg' : mime};base64,${base64}` }
}

/** Taglia e valida un testo facoltativo. */
export function optionalText(value: unknown, max: number): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: false, error: 'Testo non valido' }
  const text = value.trim()
  if (text.length > max) return { ok: false, error: `Testo troppo lungo (massimo ${max} caratteri)` }
  return { ok: true, value: text || null }
}
