import { MapPin, MessageCircle, Navigation as NavIcon, Phone } from 'lucide-react'
import { site } from '@/lib/site'

export function MapEmbed({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-cream-200 bg-cream-100 shadow-soft dark:border-white/10 dark:bg-maiolica-900 ${className}`}>
      <iframe
        src={site.mapsEmbedUrl}
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0 dark:opacity-90 dark:[filter:invert(0.9)_hue-rotate(180deg)]"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mappa: Trattoria Da Piero a Mondello"
        allowFullScreen
      />
    </div>
  )
}

export function ContactCards() {
  const items = [
    {
      icon: MapPin,
      label: 'Indirizzo',
      value: site.address.full,
      href: site.mapsUrl,
      external: true,
    },
    { icon: Phone, label: 'Telefono', value: site.phone.display, href: site.phone.href },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: site.whatsapp.display,
      href: site.whatsapp.href,
      external: true,
    },
  ]
  return (
    <ul className="space-y-3">
      {items.map(({ icon: Icon, label, value, href, external }) => (
        <li key={label}>
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maiolica-700/10 text-maiolica-700 dark:bg-limone-400/15 dark:text-limone-300">
              <Icon size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted dark:text-cream-200/60">
                {label}
              </span>
              <span className="block truncate font-medium text-maiolica-900 dark:text-cream-50">{value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function VisitSection() {
  return (
    <section className="section" aria-labelledby="vieni-a-trovarci">
      <div className="container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4">Vieni a trovarci</p>
          <h2 id="vieni-a-trovarci" className="heading text-maiolica-900 dark:text-cream-50">
            Sulla piazza di Mondello, a due passi dal mare
          </h2>
          <p className="lead mt-4">
            Tavoli all&apos;aperto, ingresso accessibile e seggioloni per i più piccoli. Per
            prenotare chiamaci o scrivici su WhatsApp.
          </p>
          <div className="mt-8">
            <ContactCards />
          </div>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full sm:w-auto">
            <NavIcon size={16} /> Ottieni indicazioni
          </a>
        </div>
        <MapEmbed className="aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[480px]" />
      </div>
    </section>
  )
}
