'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface VipItem {
  id?: number
  imageUrl: string
  title: string | null
}

const staticVips: VipItem[] = [
  {
    id: 1,
    imageUrl: '/calcio.png',
    title: 'Pippo Inzaghi, Carlo Osti e tutto lo staff tecnico',
  },
  {
    id: 2,
    imageUrl: '/Izzo.png',
    title: 'La Izzo',
  },
  {
    id: 3,
    imageUrl: '/baldini.png',
    title: 'Silvio Baldini – CT della Nazionale Under 21',
  },
  {
    id: 4,
    imageUrl: '/joe.png',
    title: 'Il grande Joe',
  },
  {
    id: 5,
    imageUrl: '/monte.png',
    title: 'Luca Cordero di Montezemolo – ex presidente Ferrari',
  },
  {
    id: 6,
    imageUrl: '/bbc.png',
    title: 'Intervista della BBC alla Trattoria Da Piero',
  },
  {
    id: 7,
    imageUrl: '/nico.png',
    title: 'Nicolo Ventola e Chiara Giuffrida',
  },
  {
    id: 8,
    imageUrl: '/Al-tahni.png',
    title: 'Nipote di Al-Tahni',
  },
  {
    id: 9,
    imageUrl: '/tognazzi.png',
    title: 'Tognazzi',
  },
  {
    id: 10,
    imageUrl: '/Ilicic.png',
    title: 'Josip Iličić',
  },
  {
    id: 11,
    imageUrl: '/Fac.png',
    title: 'Francesco Facchinetti e Giorgio Perimetri',
  },
  {
    id: 12,
    imageUrl: '/fab.png',
    title: 'Fabrizio Miccoli',
  },
]

export function VipSection() {
  const [vips, setVips] = useState<VipItem[]>(staticVips)
  const [loading, setLoading] = useState(true)
  const [selectedVip, setSelectedVip] = useState<VipItem | null>(null)

  useEffect(() => {
    const loadVips = async () => {
      try {
        const response = await fetch('/api/vip')
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setVips([...staticVips, ...data])
          }
        }
      } catch (error) {
        console.error('Error loading VIPs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVips()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
      </div>
    )
  }

  if (vips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Nessun ospite VIP al momento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {vips.map((vip) => (
          <button
            key={vip.id ?? vip.title ?? vip.imageUrl}
            type="button"
            onClick={() => setSelectedVip(vip)}
            className="bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div className="relative w-full h-40 flex items-center justify-center bg-black">
              {vip.imageUrl.startsWith('data:') || vip.imageUrl.startsWith('blob:') ? (
                <img
                  src={vip.imageUrl}
                  alt={vip.title || 'VIP Guest'}
                  className="max-h-full w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <Image
                  src={vip.imageUrl}
                  alt={vip.title || 'VIP Guest'}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            {vip.title && (
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-3">
                  {vip.title}
                </h3>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedVip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelectedVip(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm"
              onClick={() => setSelectedVip(null)}
            >
              Chiudi ✕
            </button>
            <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden">
              {selectedVip.imageUrl.startsWith('data:') ||
              selectedVip.imageUrl.startsWith('blob:') ? (
                <img
                  src={selectedVip.imageUrl}
                  alt={selectedVip.title || 'VIP Guest'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={selectedVip.imageUrl}
                  alt={selectedVip.title || 'VIP Guest'}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            {selectedVip.title && (
              <p className="mt-4 text-center text-sm md:text-base text-gray-800 dark:text-gray-200">
                {selectedVip.title}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

