import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

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
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              Il Nostro Menù
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Visualizza il nostro menù completo
              </p>
              <a
                href="https://amavery.com/menu/trattoria-da-piero/21/?vm=T"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Apri il Menù
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

