'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
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
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-16 max-w-xl text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Grazie per il tuo ordine!
          </h1>
          {orderNumber && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Numero ordine: <span className="font-semibold">{orderNumber}</span>
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Riceverai una email di conferma con il riepilogo. Per qualsiasi domanda
            puoi contattarci direttamente.
          </p>
          <Link
            href="/ecommerce"
            className="inline-block px-5 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
          >
            Continua lo shopping
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  )
}
