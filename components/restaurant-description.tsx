'use client'

import { EditableText } from './editable-text'
import { useState, useEffect } from 'react'

export function RestaurantDescription() {
  const [desc1, setDesc1] = useState('Benvenuti alla <strong>Trattoria Da Piero</strong>, il vostro punto di riferimento tra i <strong>ristoranti a Mondello</strong>. Situata in una <strong>località caratteristica</strong> con <strong>vista mare</strong> e <strong>vicino la spiaggia</strong>, offriamo un\'esperienza culinaria autentica nel cuore del <strong>lungomare Mondello</strong>.')
  const [desc2, setDesc2] = useState('La nostra trattoria è un <strong>luogo tipico siciliano</strong> dove potrete gustare le migliori <strong>specialità siciliane</strong>, preparate seguendo le <strong>tradizioni locali</strong>. Perfetta per un <strong>pranzo veloce</strong> durante la giornata o per una <strong>cena romantica</strong> al tramonto, con il mare come sfondo.')
  const [desc3, setDesc3] = useState('Ogni piatto racconta la storia della Sicilia, con ingredienti freschi e ricette che celebrano le <strong>tradizioni locali</strong>. Venite a trovarci in questo <strong>luogo tipico siciliano</strong> sul <strong>lungomare Mondello</strong> per un\'esperienza gastronomica indimenticabile.')

  useEffect(() => {
    const saved1 = localStorage.getItem('content_desc1')
    const saved2 = localStorage.getItem('content_desc2')
    const saved3 = localStorage.getItem('content_desc3')
    if (saved1) setDesc1(saved1)
    if (saved2) setDesc2(saved2)
    if (saved3) setDesc3(saved3)
  }, [])

  // Listen for storage changes to update in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const saved1 = localStorage.getItem('content_desc1')
      const saved2 = localStorage.getItem('content_desc2')
      const saved3 = localStorage.getItem('content_desc3')
      if (saved1) setDesc1(saved1)
      if (saved2) setDesc2(saved2)
      if (saved3) setDesc3(saved3)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleSave = (key: string, value: string) => {
    localStorage.setItem(`content_${key}`, value)
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('storage'))
    // TODO: Salvare nel database
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <p 
          className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center"
          dangerouslySetInnerHTML={{ __html: desc1 }}
        />
        <p 
          className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mt-4"
          dangerouslySetInnerHTML={{ __html: desc2 }}
        />
        <p 
          className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mt-4"
          dangerouslySetInnerHTML={{ __html: desc3 }}
        />
      </div>
    </div>
  )
}

