import Image from 'next/image'
import type { Metadata } from 'next'
import { PageShell, PageHeader } from '@/components/page-shell'
import { StaffSection } from '@/components/staff-section'

export const metadata: Metadata = {
  title: 'Chi siamo | Trattoria da Piero Mondello',
  description:
    "La storia della famiglia Giammanco: dal 1930 a Mondello, dal piccolo locale di Nonna Rosalia alla trattoria siciliana dello chef Piero.",
}

const timeline = [
  { year: '1930', text: 'Nonna Rosalia apre a Mondello un piccolo locale dove si cucinano polpi e piatti semplici.' },
  { year: 'Ieri', text: 'Piero cresce accanto al padre Vincenzo e trasforma quella tradizione in una vera trattoria siciliana.' },
  { year: 'Oggi', text: 'I figli Arthur e Vincenzo seguono le orme del padre, con lo stesso amore e la stessa dedizione.' },
]

export default function ChiSiamoPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="La nostra storia"
        title="Chi siamo"
        description="Una storia fatta di mare, famiglia e passione."
      />

      <section className="section pt-12">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed text-ink-soft dark:text-cream-200/80">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-arancia-600 dark:first-letter:text-limone-300">
                È una famiglia storica di Mondello, da sempre legata al mare e alle tradizioni della
                borgata. Piero nasce e cresce in una realtà umile, dove il lavoro e il rispetto per la
                materia prima sono valori fondamentali, tramandati dal padre e dai nonni, pescatori
                veterani.
              </p>
              <p>
                Nel lontano 1930, Nonna Rosalia aprì proprio qui un piccolo locale in cui si cucinavano
                polpi e piatti semplici, dando vita a una storia di cucina autentica che ancora oggi
                continua. Crescendo accanto al padre Vincenzo, Piero ha trasformato quella tradizione in
                una vera e propria trattoria siciliana, diventata negli anni un punto di riferimento per
                palermitani e turisti.
              </p>
              <p>
                Nel tempo, la trattoria ha accolto numerosi VIP, attori, giornalisti e sportivi, senza
                mai perdere la sua identità fatta di genuinità e passione.
              </p>
              <p>
                Oggi questa storia continua anche grazie ai figli Arthur e Vincenzo, che stanno seguendo
                le orme del padre con lo stesso amore e la stessa dedizione. La cucina a vista, il
                sorriso, l&apos;accoglienza calorosa e il rispetto per ciò che si fa ogni giorno
                contraddistinguono tutta la famiglia, rendendo ogni esperienza un momento autentico di
                convivialità siciliana.
              </p>
              <p>Qui non si serve solo cibo, ma una storia fatta di mare, famiglia e passione.</p>
            </div>

            <blockquote className="relative mt-10 rounded-3xl border-l-4 border-limone-400 bg-cream-100 p-6 font-serif text-xl italic leading-relaxed text-maiolica-900 dark:bg-maiolica-900 dark:text-cream-50 sm:p-8 sm:text-2xl">
              Ogni piatto che esce dalla nostra cucina è un invito a sedersi, rallentare e sentirsi a
              casa: un brindisi alla Mondello di ieri e di oggi, che continua a vivere nei profumi, nei
              sapori e nei sorrisi di chi varca la porta della Trattoria Da Piero.
            </blockquote>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
                <Image
                  src="/copertina.png"
                  alt="La Trattoria Da Piero a Mondello"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <ol className="mt-8 space-y-6 border-l-2 border-cream-200 pl-6 dark:border-white/10">
                {timeline.map((t) => (
                  <li key={t.year} className="relative">
                    <span className="absolute -left-[1.95rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-cream bg-arancia-500 dark:border-maiolica-950 dark:bg-limone-400" aria-hidden />
                    <p className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">{t.year}</p>
                    <p className="mt-1 text-ink-soft dark:text-cream-200/75">{t.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <StaffSection />
    </PageShell>
  )
}
