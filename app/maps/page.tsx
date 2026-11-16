import type { Metadata } from 'next'
import { Navigation as NavIcon } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { ContactCards, MapEmbed } from '@/components/visit-section'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Dove siamo | Trattoria da Piero Mondello',
  description: `Trattoria Da Piero, ${site.address.full}. Sulla piazza di Mondello, a due passi dal mare.`,
}

export default function MapsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Vieni a trovarci"
        title="Dove siamo"
        description="Sulla piazza di Mondello, a due passi dalla spiaggia. Tavoli all'aperto, ingresso accessibile e seggioloni per i più piccoli."
      />
      <div className="container grid gap-8 py-10 sm:py-14 lg:grid-cols-12">
        <MapEmbed className="aspect-square sm:aspect-[16/10] lg:order-2 lg:col-span-8 lg:aspect-auto lg:min-h-[520px]" />
        <div className="lg:col-span-4">
          <ContactCards />
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full">
            <NavIcon size={16} /> Apri in Google Maps
          </a>
        </div>
      </div>
    </PageShell>
  )
}
