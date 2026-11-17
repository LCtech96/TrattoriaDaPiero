'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Phone } from 'lucide-react'
import { EditableText } from './editable-text'
import { useGeneralImage } from '@/lib/use-general-image'
import { site } from '@/lib/site'

function SmartImage({
  src,
  fallback,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string
  fallback: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  // next/image solo per le immagini del sito: le altre (base64, blob, URL esterni)
  // si mostrano direttamente, senza passare dall'ottimizzatore.
  if (!src.startsWith('/') || src.startsWith('//')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className ?? ''}`}
        onError={(e) => {
          e.currentTarget.src = fallback
        }}
      />
    )
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
}

export function HomeHero() {
  const [restaurantName, setRestaurantName] = useState('Trattoria Da Piero')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Specialità Mondello')
  const cover = useGeneralImage('cover')
  const profile = useGeneralImage('profile')

  useEffect(() => {
    const sync = () => {
      const savedName = localStorage.getItem('content_restaurant_name')
      const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
      if (savedName) setRestaurantName(savedName)
      if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
    }
    sync()
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const save = (key: string, value: string) => {
    localStorage.setItem(key, value)
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <section className="relative overflow-hidden">
      <div className="tile-band pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div className="container relative grid items-center gap-10 pb-14 pt-0 sm:pt-8 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-14">
        {/* Immagine */}
        <div className="relative -mx-4 sm:mx-0 lg:order-2 lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden sm:rounded-[2rem] sm:shadow-lift lg:aspect-[6/5]">
            <SmartImage
              src={cover.src}
              fallback={cover.fallback}
              alt="La facciata della Trattoria Da Piero a Mondello, decorata con limoni e maioliche"
              sizes="(min-width: 1024px) 680px, 100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maiolica-950/40 via-transparent to-transparent" aria-hidden />
          </div>

          {/* Badge chef */}
          <div className="absolute -bottom-8 left-4 flex items-center gap-3 sm:left-6 lg:-bottom-6 lg:-left-8">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-cream bg-white shadow-lift dark:border-maiolica-950 sm:h-28 sm:w-28">
              <SmartImage
                src={profile.src}
                fallback={profile.fallback}
                alt="Firma dello chef Piero Giammanco"
                sizes="112px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Etichetta "dal 1930" */}
          <div className="absolute right-4 top-4 rounded-full bg-cream/95 px-4 py-2 text-center shadow-soft backdrop-blur dark:bg-maiolica-950/90 sm:right-6 sm:top-6">
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-arancia-600 dark:text-limone-300">
              dal
            </span>
            <span className="block font-serif text-xl leading-none text-maiolica-900 dark:text-cream-50">
              {site.since}
            </span>
          </div>
        </div>

        {/* Testo */}
        <div className="relative pt-6 lg:order-1 lg:col-span-5 lg:pt-0">
          <EditableText
            value={restaurantSubtitle}
            onSave={(v) => {
              setRestaurantSubtitle(v)
              save('content_restaurant_subtitle', v)
            }}
            tag="p"
            className="eyebrow mb-5"
          />
          <EditableText
            value={restaurantName}
            onSave={(v) => {
              setRestaurantName(v)
              save('content_restaurant_name', v)
            }}
            tag="h1"
            className="display !text-5xl text-maiolica-900 dark:text-cream-50 sm:!text-6xl xl:!text-7xl"
          />
          <p className="mt-5 max-w-md font-serif text-xl italic leading-snug text-maiolica-700 dark:text-limone-200 sm:text-2xl">
            Il tuo punto di riferimento tra i ristoranti a Mondello
          </p>
          <p className="lead mt-4 max-w-md">
            Pesce del golfo, ricette di famiglia e la cucina a vista dello chef Piero Giammanco,
            a due passi dalla spiaggia.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="btn-primary !px-6">
              Scopri il menù <ArrowRight size={16} />
            </Link>
            <a href={site.phone.href} className="btn-outline !px-6">
              <Phone size={16} /> Prenota un tavolo
            </a>
          </div>

          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-maiolica-700 dark:text-cream-200/70 dark:hover:text-white"
          >
            <MapPin size={16} className="text-arancia-500" />
            {site.address.full}
          </a>
        </div>
      </div>
    </section>
  )
}
