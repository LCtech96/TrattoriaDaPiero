import type { Metadata } from 'next'
import { PageShell, PageHeader } from '@/components/page-shell'
import { VipSection } from '@/components/vip-section'

export const metadata: Metadata = {
  title: 'Ospiti VIP | Trattoria da Piero Mondello',
  description: 'Attori, giornalisti e sportivi che hanno scelto la Trattoria Da Piero a Mondello.',
}

export default function VipPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Ospiti illustri"
        title="I nostri ospiti VIP"
        description="Nel tempo la trattoria ha accolto attori, giornalisti e sportivi, senza mai perdere la sua identità fatta di genuinità e passione."
      />
      <div className="container py-10 sm:py-14">
        <VipSection />
      </div>
    </PageShell>
  )
}
