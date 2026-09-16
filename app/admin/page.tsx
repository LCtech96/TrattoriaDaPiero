'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Image as ImageIcon, FileText, PlusSquare, ShoppingBag, Receipt } from 'lucide-react'
import Link from 'next/link'
import { checkAdminSession, adminLogout } from '@/lib/admin-session'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    checkAdminSession().then((ok) => {
      if (cancelled) return
      if (!ok) {
        router.push('/admin/login')
      } else {
        setIsAuthenticated(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
    router.refresh()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pannello Amministrazione
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Esci
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/images"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <ImageIcon size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Immagini Piatti
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aggiungi e ritaglia immagini per piatti, dolci, bevande e vini
            </p>
          </Link>

          <Link
            href="/admin/images/general"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <ImageIcon size={48} className="text-purple-600 dark:text-purple-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Immagini Generali
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci immagini di copertina e profilo del ristorante
            </p>
          </Link>

          <Link
            href="/admin/content"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <FileText size={48} className="text-green-600 dark:text-green-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Modifica Contenuti
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Modifica testi, descrizioni e didascalie del sito
            </p>
          </Link>

          <Link
            href="/admin/posts"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <PlusSquare size={48} className="text-orange-600 dark:text-orange-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Post del Giorno
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Crea e gestisci i post del piatto del giorno per il feed
            </p>
          </Link>

          <Link
            href="/admin/vip"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <PlusSquare size={48} className="text-yellow-600 dark:text-yellow-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gestione VIP
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aggiungi e gestisci le foto dei VIP che hanno visitato il ristorante
            </p>
          </Link>

          <Link
            href="/admin/ecommerce"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <ShoppingBag size={48} className="text-teal-600 dark:text-teal-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              E-commerce - Prodotti
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Carica, modifica ed elimina prodotti: titolo, descrizione, prezzo,
              quantita, misure e foto
            </p>
          </Link>

          <Link
            href="/admin/ecommerce/ordini"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Receipt size={48} className="text-rose-600 dark:text-rose-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              E-commerce - Ordini e Pagamenti
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Consulta gli ordini ricevuti, i pagamenti Stripe e registra incassi
              in contanti o bonifico
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

