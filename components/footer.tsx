import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/lib/site'

const links = [
  { href: '/menu', label: 'Menù' },
  { href: '/chi-siamo', label: 'Chi siamo' },
  { href: '/vip', label: 'Ospiti VIP' },
  { href: '/ecommerce', label: 'Shop online' },
  { href: '/maps', label: 'Dove siamo' },
]

export function Footer() {
  return (
    <footer className="relative mt-16 bg-maiolica-950 text-cream-100 md:mt-24">
      <div className="tile-band h-3 opacity-90" aria-hidden />
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative h-14 w-14 overflow-hidden rounded-full bg-white">
              <Image src="/profilo.png" alt="" fill sizes="56px" className="object-cover" />
            </span>
            <span>
              <span className="block font-serif text-2xl text-cream-50">Trattoria Da Piero</span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-limone-300">
                Mondello · dal {site.since}
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-200/70">
            Cucina tipica siciliana e pesce del golfo di Mondello, nella trattoria di famiglia
            dello chef Piero Giammanco, sul lungomare.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition hover:border-limone-300 hover:text-limone-300"
            >
              <Instagram size={19} />
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition hover:border-limone-300 hover:text-limone-300"
            >
              <Facebook size={19} />
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-limone-300">
            Contatti
          </h2>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-cream-200/80 hover:text-white">
                <MapPin size={17} className="mt-0.5 shrink-0 text-arancia-400" />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.city}
                </span>
              </a>
            </li>
            <li>
              <a href={site.phone.href} className="flex items-center gap-3 text-cream-200/80 hover:text-white">
                <Phone size={17} className="shrink-0 text-arancia-400" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-cream-200/80 hover:text-white">
                <MessageCircle size={17} className="shrink-0 text-arancia-400" />
                {site.whatsapp.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 break-all text-cream-200/80 hover:text-white">
                <Mail size={17} className="shrink-0 text-arancia-400" />
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4 lg:pl-8">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-limone-300">
            Esplora
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream-200/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-6 pb-[calc(var(--mobile-bar-h)+1.5rem+env(safe-area-inset-bottom))] text-xs text-cream-200/60 sm:flex-row sm:items-center sm:justify-between lg:pb-6">
          <p>© {new Date().getFullYear()} Trattoria Da Piero · Mondello, Palermo</p>
          <p>
            Creato da{' '}
            <a href="https://facevoice.ai/ai-chat" target="_blank" rel="noopener noreferrer" className="text-cream-100 underline-offset-4 hover:underline">
              Facevoice.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
