import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { MenuList } from '@/components/menu-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menù | Trattoria da Piero Mondello',
  description: 'Scopri il menù completo della Trattoria da Piero: antipasti, primi, risotti, secondi, insalate, dolci, bevande e cocktail.',
}

export default function MenuPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 mb-6 transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Indietro</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Il Nostro Menù
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Il menù può variare in base al pescato giornaliero, pescato nel golfo di Mondello e Isola delle Femmine.
          </p>
          <MenuList />
        </div>
      </div>
      <Footer />
    </main>
  )
}

