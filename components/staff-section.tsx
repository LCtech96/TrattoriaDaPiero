'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function StaffSection() {
  const [ownerImage, setOwnerImage] = useState<string | null>(null)
  const [ownerName, setOwnerName] = useState<string>('Piero Giammanco')
  const [ownerDescription, setOwnerDescription] = useState<string>(
    "Piero Giammanco, titolare e chef della Trattoria Da Piero, porta avanti con passione la tradizione culinaria siciliana. La sua dedizione alla qualità e all'autenticità si riflette in ogni piatto che esce dalla nostra cucina."
  )

  useEffect(() => {
    const loadOwnerPhoto = async () => {
      try {
        // Prima prova a caricare dal database
        const response = await fetch('/api/staff/owner')
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            const imageUrl = data.imageUrl
            localStorage.setItem('owner_image', imageUrl)
            
            // Per Android, converti in blob URL
            if (isAndroid() && imageUrl.startsWith('data:image')) {
              const blobUrl = base64ToBlobUrl(imageUrl)
              if (blobUrl) {
                setOwnerImage(blobUrl)
              } else {
                setOwnerImage(imageUrl)
              }
            } else {
              setOwnerImage(imageUrl)
            }
            
            if (data.name) setOwnerName(data.name)
            if (data.description) setOwnerDescription(data.description)
            return
          }
        }
      } catch (error) {
        console.error('Error loading owner photo:', error)
      }

      // Fallback a localStorage
      const savedImage = localStorage.getItem('owner_image')
      if (savedImage) {
        if (isAndroid() && savedImage.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedImage)
          if (blobUrl) {
            setOwnerImage(blobUrl)
          } else {
            setOwnerImage(savedImage)
          }
        } else {
          setOwnerImage(savedImage)
        }
      }
    }

    loadOwnerPhoto()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadOwnerPhoto()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Restaurant Description */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Trattoria Da Piero
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          La Trattoria Da Piero nasce dalla passione per la cucina siciliana e il desiderio 
          di offrire ai nostri ospiti un&apos;esperienza culinaria autentica e indimenticabile. 
          Situata sul lungomare Mondello, il nostro ristorante unisce la tradizione 
          della cucina siciliana con un ambiente caratteristico, creando un menu che celebra 
          i sapori del territorio.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Con vista mare e vicino alla spiaggia, la Trattoria Da Piero accoglie ogni giorno 
          chi desidera gustare l&apos;eccellenza della cucina siciliana in un ambiente elegante 
          e accogliente, perfetto per un pranzo veloce o una cena romantica.
        </p>
      </section>

      {/* Owner */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Il Titolare
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mx-auto md:mx-0 overflow-hidden relative">
            <Image
              src="/titolare.png"
              alt="Piero Giammanco - Titolare e Chef"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Piero Giammanco
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {ownerDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Staff Members */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Il Nostro Staff
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden relative">
              <Image
                src="/direttore.png"
                alt="Fabio Mezzapelle"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Fabio Mezzapelle
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Direttore di sala, punto di riferimento dell&apos;accoglienza, coordina il servizio con eleganza e attenzione ad ogni dettaglio.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden relative">
              <Image
                src="/vice.png"
                alt="Ignazio Orofino"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Ignazio Orofino
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Vice direttore, soprannominato &quot;Occhio vivo&quot;, vigila su ogni tavolo per garantire un servizio rapido, cordiale e impeccabile.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden relative">
              <Image
                src="/tony.png"
                alt='Tony Nicolosi "Koreano"'
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Tony Nicolosi
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Chef, detto &quot;Koreano&quot;, è il motore della cucina: coordina la brigata con energia e cura, portando in tavola piatti sempre precisi e ricchi di gusto.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}



