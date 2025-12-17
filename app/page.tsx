import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/home-hero'
import { Highlights } from '@/components/highlights'
import { RestaurantDescription } from '@/components/restaurant-description'
import { PostsFeed } from '@/components/posts-feed'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Trattoria da Piero Mondello | Cucina Tipica Siciliana',
  description: 'Scopri il miglior ristorante a Mondello con pesce fresco, vista mare e vicino alla spiaggia. Cucina tipica siciliana in un ambiente accogliente sul lungomare.',
  alternates: {
    canonical: 'https://trattoriadapieromondello.site',
  },
  openGraph: {
    title: 'Trattoria da Piero Mondello | Cucina Tipica Siciliana',
    description: 'Scopri il miglior ristorante a Mondello con pesce fresco, vista mare e vicino alla spiaggia. Cucina tipica siciliana in un ambiente accogliente sul lungomare.',
    url: 'https://trattoriadapieromondello.site',
    siteName: 'Trattoria da Piero Mondello',
    locale: 'it_IT',
    type: 'website',
  },
}

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Trattoria da Piero',
  url: 'https://trattoriadapieromondello.site',
  image: 'https://www.instagram.com/trattoria_da_piero_mondello?igsh=YWNmbWR1N2Z0dTJ0&utm_source=qr',
  telephone: ['091450747', '3200738966'],
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Piazza Mondello, 12',
    addressLocality: 'Palermo',
    addressRegion: 'PA',
    postalCode: '90151',
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '38.2000',
    longitude: '13.3250',
  },
  servesCuisine: ['Siciliana', 'Pesce fresco'],
  menu: 'https://trattoriadapieromondello.site/menu',
  acceptsReservations: true,
  paymentAccepted: ['Carte di credito', 'Carte di debito', 'Pagamenti mobile NFC', 'Contanti'],
  currenciesAccepted: 'EUR',
  accessibilityFeature: [
    'Ingresso accessibile in sedia a rotelle',
    'Tavoli accessibili in sedia a rotelle',
  ],
  amenityFeature: [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Tavoli all\'aperto',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Asporto',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Consumazione sul posto',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Toilette',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Seggioloni per bambini',
      value: true,
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '50',
  },
  hasMenu: {
    '@type': 'Menu',
    url: 'https://trattoriadapieromondello.site/menu',
  },
  description: 'Ristorante a Mondello con pesce fresco, vista mare e vicino alla spiaggia. Cucina tipica siciliana, ottima carta dei vini, ottimi dessert e ottimo caffè. Ambiente accogliente e romantico, ideale per pranzo e cena. Adatto a gruppi e turisti.',
  areaServed: {
    '@type': 'City',
    name: 'Palermo',
  },
  suitableForChildren: true,
}

export default function Home() {
  return (
    <>
      <Script
        id="restaurant-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantSchema),
        }}
      />
      <main className="min-h-screen">
        <Navigation />
      <div className="pt-16 md:pt-20">
        <HomeHero />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Il tuo punto di riferimento tra i ristoranti a Mondello
          </h1>
        </div>
        <Highlights />
        <RestaurantDescription />
        <PostsFeed />
      </div>
      <Footer />
    </main>
    </>
  )
}

