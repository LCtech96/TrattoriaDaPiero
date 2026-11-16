import { PageShell, PageHeader } from '@/components/page-shell'
import { MenuList } from '@/components/menu-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menù | Trattoria da Piero Mondello',
  description:
    'Scopri il menù completo della Trattoria da Piero: antipasti, primi, risotti, secondi, insalate, dolci, bevande e cocktail.',
}

export default function MenuPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="La nostra cucina"
        title="Il Menù"
        description="Il menù può variare in base al pescato giornaliero, pescato nel golfo di Mondello e Isola delle Femmine. Tocca un piatto per personalizzarlo e aggiungerlo al tuo ordine."
      />
      <div className="container pb-8">
        <MenuList />
      </div>
    </PageShell>
  )
}
