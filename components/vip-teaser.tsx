import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { staticVips } from './vip-data'

export function VipTeaser() {
  const vips = staticVips.slice(0, 8)
  return (
    <section className="section overflow-hidden bg-maiolica-900 text-cream-50 dark:bg-maiolica-900/60" aria-labelledby="ospiti">
      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow mb-4 !text-limone-300">Ospiti illustri</p>
            <h2 id="ospiti" className="heading text-cream-50">
              Hanno scelto la nostra tavola
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-200/75 sm:text-lg">
              Attori, giornalisti e sportivi: nel tempo la trattoria ha accolto tanti volti noti,
              senza mai perdere la sua anima genuina.
            </p>
          </div>
          <Link href="/vip" className="btn-accent self-start sm:self-auto">
            Tutti gli ospiti <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:grid lg:max-w-[1280px] lg:grid-cols-4 lg:overflow-visible lg:px-8">
        {vips.map((vip) => (
          <Link
            key={vip.id}
            href="/vip"
            className="group relative aspect-[4/5] w-[68vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl bg-maiolica-950 sm:w-[42vw] lg:w-auto lg:max-w-none"
          >
            <Image
              src={vip.imageUrl}
              alt={vip.title ?? 'Ospite VIP'}
              fill
              sizes="(min-width: 1024px) 300px, 68vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maiolica-950/90 via-maiolica-950/10 to-transparent" />
            <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium leading-snug text-cream-50">
              {vip.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
