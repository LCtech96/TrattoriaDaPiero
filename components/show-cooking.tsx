import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChefHat } from 'lucide-react'

export function ShowCooking() {
  return (
    <section className="section" aria-labelledby="show-cooking">
      <div className="container grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-maiolica-900 shadow-lift">
            <Image
              src="/show-coocking.png"
              alt="Lo chef Piero Giammanco durante lo show cooking all'esterno della trattoria"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -right-2 hidden rounded-2xl bg-limone-400 px-5 py-4 text-maiolica-950 shadow-lift sm:block md:-right-6">
            <ChefHat size={22} />
            <p className="mt-1 font-serif text-lg leading-tight">Cucina a vista</p>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Show cooking</p>
          <h2 id="show-cooking" className="heading text-maiolica-900 dark:text-cream-50">
            Piero ai fornelli, davanti ai suoi ospiti
          </h2>
          <p className="lead mt-5">
            Nello spazio esterno del ristorante, Piero – il titolare – cucina a vista per i suoi
            ospiti, diventando un vero punto di riferimento. Con lo show cooking regala bellissime
            esperienze e condivide le sue ricette direttamente davanti ai clienti.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/chi-siamo" className="btn-primary">
              Conosci lo chef <ArrowRight size={16} />
            </Link>
            <Link href="/menu" className="btn-outline">
              Vedi il menù
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
