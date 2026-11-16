/**
 * Dati del ristorante usati in tutto il sito (header, footer, pagina mappe,
 * ordini WhatsApp). Le variabili d'ambiente hanno la precedenza sui default.
 */
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+393200738966'
const landline = process.env.NEXT_PUBLIC_PHONE_NUMBER || '091450747'

export const site = {
  name: 'Trattoria Da Piero',
  tagline: 'Cucina tipica siciliana a Mondello',
  since: 1930,
  address: {
    street: 'Piazza Mondello, 12',
    city: '90151 Palermo (PA)',
    full: 'Piazza Mondello, 12, 90151 Palermo',
  },
  phone: {
    display: landline,
    href: `tel:${landline.replace(/[^0-9+]/g, '')}`,
  },
  whatsapp: {
    display: whatsapp,
    number: whatsapp.replace(/[^0-9]/g, ''),
    href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`,
  },
  email: process.env.NEXT_PUBLIC_EMAIL || 'giammanco.pietro@hotmail.it',
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    'https://www.facebook.com/share/1DLhw7PCf1/?mibextid=wwXIfr',
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    'https://www.instagram.com/trattoria_da_piero_mondello?igsh=YWNmbWR1N2Z0dTJ0&utm_source=qr',
  mapsUrl: process.env.NEXT_PUBLIC_MAPS_URL || 'https://maps.app.goo.gl/Dqj5484ZEMdB9cA7A',
  mapsEmbedUrl:
    process.env.NEXT_PUBLIC_MAPS_EMBED_URL ||
    'https://maps.google.com/maps?q=Trattoria%20Da%20Piero%2C%20Piazza%20Mondello%2012%2C%20Palermo&z=16&output=embed',
} as const

export function whatsappLink(text?: string) {
  return text ? `${site.whatsapp.href}?text=${encodeURIComponent(text)}` : site.whatsapp.href
}
