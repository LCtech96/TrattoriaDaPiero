'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const defaults = {
  desc1:
    "Benvenuti alla <strong>Trattoria Da Piero</strong>, il vostro punto di riferimento tra i <strong>ristoranti a Mondello</strong>. Situata in una <strong>località caratteristica</strong> con <strong>vista mare</strong> e <strong>vicino la spiaggia</strong>, offriamo un'esperienza culinaria autentica nel cuore del <strong>lungomare Mondello</strong>.",
  desc2:
    'La nostra trattoria è un <strong>luogo tipico siciliano</strong> dove potrete gustare le migliori <strong>specialità siciliane</strong>, preparate seguendo le <strong>tradizioni locali</strong>. Perfetta per un <strong>pranzo veloce</strong> durante la giornata o per una <strong>cena romantica</strong> al tramonto, con il mare come sfondo.',
  desc3:
    "Ogni piatto racconta la storia della Sicilia, con ingredienti freschi e ricette che celebrano le <strong>tradizioni locali</strong>. Venite a trovarci in questo <strong>luogo tipico siciliano</strong> sul <strong>lungomare Mondello</strong> per un'esperienza gastronomica indimenticabile.",
}

type Key = keyof typeof defaults

/**
 * Mostra il testo in modo sicuro: l'unico markup ammesso è <strong>…</strong>,
 * tutto il resto viene visualizzato come testo (mai eseguito come HTML).
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(<strong>[\s\S]*?<\/strong>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const bold = /^<strong>([\s\S]*?)<\/strong>$/.exec(part)
        return bold ? <strong key={i}>{bold[1]}</strong> : <span key={i}>{part}</span>
      })}
    </>
  )
}

export function RestaurantDescription() {
  const [desc, setDesc] = useState(defaults)

  useEffect(() => {
    const sync = () => {
      setDesc((prev) => {
        const next = { ...prev }
        ;(Object.keys(defaults) as Key[]).forEach((k) => {
          const saved = localStorage.getItem(`content_${k}`)
          if (saved) next[k] = saved
        })
        return next
      })
    }
    sync()
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return (
    <section className="section relative overflow-hidden bg-cream-100/70 dark:bg-maiolica-900/40" aria-labelledby="benvenuti">
      <div className="container grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4">Benvenuti</p>
          <h2 id="benvenuti" className="heading text-maiolica-900 dark:text-cream-50">
            Una trattoria di famiglia sul lungomare
          </h2>

          <div className="relative mt-10 overflow-hidden rounded-3xl bg-maiolica-800 p-8 text-cream-50 shadow-lift sm:p-10">
            <div className="tile-band absolute inset-0 opacity-[0.12]" aria-hidden />
            <div className="relative">
              <p className="font-serif text-7xl leading-none text-limone-300 sm:text-8xl">1930</p>
              <p className="mt-4 max-w-xs text-base leading-relaxed text-cream-100/90">
                Nonna Rosalia apre a Mondello un piccolo locale dove si cucinano polpi e piatti
                semplici. Da allora la storia continua, di padre in figlio.
              </p>
              <Link
                href="/chi-siamo"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-limone-300 hover:text-limone-200"
              >
                Leggi la nostra storia <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-ink-soft dark:text-cream-200/80 sm:text-lg lg:col-span-7 [&_strong]:font-semibold [&_strong]:text-maiolica-900 dark:[&_strong]:text-cream-50">
          <p className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-arancia-600 dark:first-letter:text-limone-300" >
            <RichText text={desc.desc1} />
          </p>
          <p>
            <RichText text={desc.desc2} />
          </p>
          <p>
            <RichText text={desc.desc3} />
          </p>
        </div>
      </div>
    </section>
  )
}
