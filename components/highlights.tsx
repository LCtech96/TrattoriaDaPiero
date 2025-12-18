'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Highlight {
  id: string
  label: string
  imageSrc: string
}

const highlights: Highlight[] = [
  { id: 'ingredienti', label: 'Ingredienti', imageSrc: '/uva.png' },
  { id: 'allergeni', label: 'Allergeni', imageSrc: '/arancia.png' },
  { id: 'vegan', label: 'Vegan/Gluten Free', imageSrc: '/limone.png' },
  { id: 'bestseller', label: 'Best Seller', imageSrc: '/moro.png' },
]

export function Highlights() {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {highlights.map((highlight) => {
          const isActive = activeHighlight === highlight.id

          return (
            <button
              key={highlight.id}
              onClick={() => setActiveHighlight(isActive ? null : highlight.id)}
              className={cn(
                'rounded-full overflow-hidden transition-all',
                'border-2 border-transparent',
                isActive && 'ring-2 ring-amber-500 dark:ring-amber-400 scale-105',
                'hover:scale-105 active:scale-95'
              )}
              style={{
                width: '80px',
                height: '80px',
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={highlight.imageSrc}
                  alt={highlight.label}
                  fill
                  className="object-cover"
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

