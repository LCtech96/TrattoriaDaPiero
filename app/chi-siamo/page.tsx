import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { StaffSection } from '@/components/staff-section'

export default function ChiSiamoPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Indietro</span>
          </Link>
          <div className="max-w-3xl mx-auto mb-12 content-surface px-4 py-6 md:px-6 md:py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Chi Siamo
            </h1>

            <section className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
            <p>
              È una famiglia storica di Mondello, da sempre legata al mare e alle tradizioni della borgata.
              Piero nasce e cresce in una realtà umile, dove il lavoro e il rispetto per la materia prima
              sono valori fondamentali, tramandati dal padre e dai nonni, pescatori veterani.
            </p>
            <p>
              Nel lontano 1930, Nonna Rosalia aprì proprio qui un piccolo locale in cui si cucinavano polpi
              e piatti semplici, dando vita a una storia di cucina autentica che ancora oggi continua.
              Crescendo accanto al padre Vincenzo, Piero ha trasformato quella tradizione in una vera e
              propria trattoria siciliana, diventata negli anni un punto di riferimento per palermitani e turisti.
            </p>
            <p>
              Nel tempo, la trattoria ha accolto numerosi VIP, attori, giornalisti e sportivi, senza mai
              perdere la sua identità fatta di genuinità e passione.
            </p>
            <p>
              Oggi questa storia continua anche grazie ai figli Arthur e Vincenzo, che stanno seguendo le orme
              del padre con lo stesso amore e la stessa dedizione. La cucina a vista, il sorriso,
              l&apos;accoglienza calorosa e il rispetto per ciò che si fa ogni giorno contraddistinguono tutta
              la famiglia, rendendo ogni esperienza un momento autentico di convivialità siciliana.
            </p>
            <p>
              Qui non si serve solo cibo, ma una storia fatta di mare, famiglia e passione.
            </p>
            <p className="italic text-gray-800 dark:text-gray-200">
              Ogni piatto che esce dalla nostra cucina è un invito a sedersi, rallentare e sentirsi a casa:
              un brindisi alla Mondello di ieri e di oggi, che continua a vivere nei profumi, nei sapori
              e nei sorrisi di chi varca la porta della Trattoria Da Piero.
            </p>
            </section>
          </div>

          <StaffSection />
        </div>
      </div>
      <Footer />
    </main>
  )
}

