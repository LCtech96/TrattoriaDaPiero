import Image from 'next/image'

const staff = [
  {
    name: 'Fabio Mezzapelle',
    role: 'Direttore di sala',
    image: '/direttore.png',
    text: "Punto di riferimento dell'accoglienza, coordina il servizio con eleganza e attenzione ad ogni dettaglio.",
  },
  {
    name: 'Ignazio Orofino',
    role: 'Vice direttore · “Occhio vivo”',
    image: '/vice.png',
    text: 'Il vero personaggio del ristorante: mantiene la clientela sempre attiva e coinvolta, vigilando su ogni tavolo per garantire un servizio rapido, cordiale e impeccabile.',
  },
  {
    name: 'Tony Nicolosi',
    role: 'Chef · “Koreano”',
    image: '/tony.png',
    text: 'Il motore della cucina: coordina la brigata con energia e cura, portando in tavola piatti sempre precisi e ricchi di gusto.',
  },
]

export function StaffSection() {
  const ownerDescription =
    "Piero Giammanco, titolare e chef della Trattoria Da Piero, porta avanti con passione la tradizione culinaria siciliana. La sua dedizione alla qualità e all'autenticità si riflette in ogni piatto che esce dalla nostra cucina."

  return (
    <section className="section bg-cream-100/70 dark:bg-maiolica-900/40" aria-labelledby="la-squadra">
      <div className="container">
        {/* Titolare */}
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-lift md:max-w-none">
            <Image
              src="/titolare.png"
              alt="Piero Giammanco, titolare e chef"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-4">Il titolare</p>
            <h2 className="heading text-maiolica-900 dark:text-cream-50">Piero Giammanco</h2>
            <p className="mt-2 font-serif text-xl italic text-arancia-600 dark:text-limone-300">Titolare e chef</p>
            <p className="lead mt-5">{ownerDescription}</p>
            <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-200/75">
              Con vista mare e vicino alla spiaggia, la Trattoria Da Piero accoglie ogni giorno chi
              desidera gustare l&apos;eccellenza della cucina siciliana in un ambiente accogliente,
              perfetto per un pranzo veloce o una cena romantica.
            </p>
          </div>
        </div>

        {/* Staff */}
        <div className="mt-20 text-center">
          <p className="eyebrow mb-4">La squadra</p>
          <h2 id="la-squadra" className="heading text-maiolica-900 dark:text-cream-50">
            Il nostro staff
          </h2>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((p) => (
            <li key={p.name} className="card overflow-hidden">
              <div className="relative aspect-[4/5] bg-cream-200 dark:bg-maiolica-950">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">{p.name}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-arancia-600 dark:text-limone-300">
                  {p.role}
                </p>
                <p className="mt-3 leading-relaxed text-ink-soft dark:text-cream-200/75">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
