import Image from 'next/image'

const highlights = [
  {
    id: 'pescato',
    title: 'Pescato del giorno',
    text: 'Il menù segue il pescato del golfo di Mondello e di Isola delle Femmine.',
    imageSrc: '/limone.png',
  },
  {
    id: 'tradizione',
    title: 'Tradizione di famiglia',
    text: 'Dal 1930, quando Nonna Rosalia cucinava polpi proprio qui, sulla piazza.',
    imageSrc: '/moro.png',
  },
  {
    id: 'vini',
    title: 'Carta dei vini',
    text: 'Una carta curata per accompagnare il pesce e i piatti della tradizione.',
    imageSrc: '/uva.png',
  },
  {
    id: 'dolci',
    title: 'Dolci e caffè',
    text: 'Per chiudere in bellezza: dolci della tradizione e un ottimo caffè.',
    imageSrc: '/arancia.png',
  },
]

export function Highlights() {
  return (
    <section className="section pt-8 md:pt-12" aria-labelledby="perche-noi">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Perché sceglierci</p>
          <h2 id="perche-noi" className="heading text-maiolica-900 dark:text-cream-50">
            I sapori autentici della borgata
          </h2>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {highlights.map((h) => (
            <li key={h.id} className="group text-center">
              <div className="relative mx-auto aspect-square w-28 overflow-hidden rounded-full border-4 border-cream-50 shadow-lift ring-1 ring-cream-200 transition-transform duration-500 group-hover:-translate-y-1 dark:border-maiolica-900 dark:ring-white/10 sm:w-36">
                <Image
                  src={h.imageSrc}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 144px, 112px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-5 font-serif text-lg text-maiolica-900 dark:text-cream-50 sm:text-xl">
                {h.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-soft dark:text-cream-200/70">
                {h.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
