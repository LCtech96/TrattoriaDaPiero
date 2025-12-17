'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface VipItem {
  id: number
  imageUrl: string
  title: string | null
}

export function VipSection() {
  const [vips, setVips] = useState<VipItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVips = async () => {
      try {
        const response = await fetch('/api/vip')
        if (response.ok) {
          const data = await response.json()
          setVips(data)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vips.map((vip) => (
        <div
          key={vip.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative w-full h-64">
            {vip.imageUrl.startsWith('data:') || vip.imageUrl.startsWith('blob:') ? (
              <img
                src={vip.imageUrl}
                alt={vip.title || 'VIP Guest'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Image
                src={vip.imageUrl}
                alt={vip.title || 'VIP Guest'}
                fill
                className="object-cover"
              />
            )}
          </div>
          {vip.title && (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {vip.title}
              </h3>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

