'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { useShopCartStore } from '@/store/shop-cart-store'

function OrderConfirmation() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('numero')
  const clearCart = useShopCartStore((state) => state.clearCart)

  useEffect(() => {
    // Il carrello si svuota solo al ritorno da un pagamento riuscito.
    if (searchParams.get('esito') === 'ok') clearCart()
  }, [searchParams, clearCart])

  return (
    <PageShell>
      <div>
        <div className="container py-16 sm:py-24 max-w-xl text-center">
          <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
          <h1 className="font-serif text-4xl text-maiolica-900 dark:text-cream-50 mb-3">
            Grazie per il tuo ordine!
          </h1>
          {orderNumber && (
            <p className="text-ink-soft dark:text-cream-200/70 mb-2">
              Numero ordine: <span className="font-semibold">{orderNumber}</span>
            </p>
          )}
          <p className="text-ink-soft dark:text-cream-200/70 mb-8">
            Riceverai una email di conferma con il riepilogo. Per qualsiasi domanda
            puoi contattarci direttamente.
          </p>
          <Link
            href="/ecommerce"
            className="btn-primary"
          >
            Continua lo shopping
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  )
}
