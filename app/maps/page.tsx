'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export default function MapsPage() {
  const mapsUrl =
    process.env.NEXT_PUBLIC_MAPS_URL ||
    'https://maps.app.goo.gl/Dqj5484ZEMdB9cA7A'

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Indietro</span>
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Dove Siamo
          </h1>

          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Guarda la posizione della Trattoria Da Piero sulla mappa e tocca per
            aprire direttamente in Google Maps.
          </p>

          <div className="max-w-3xl mx-auto">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
            >
              <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800">
                <iframe
                  src={mapsUrl}
                  loading="lazy"
                  className="w-full h-full pointer-events-none"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-hidden="true"
                  title="Mappa Trattoria Da Piero"
                />
                <div className="absolute inset-0 flex items-end justify-between px-4 py-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
                  <div>
                    <p className="text-sm md:text-base font-semibold text-white">
                      Trattoria Da Piero - Mondello
                    </p>
                    <p className="text-xs md:text-sm text-gray-100">
                      Tocca per aprire in Google Maps
                    </p>
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white bg-emerald-600/90 px-3 py-1 rounded-full">
                    Apri Maps
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

