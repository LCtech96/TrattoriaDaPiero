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
                'flex flex-col items-center gap-1 p-2 rounded-full transition-all',
                'bg-white/90 dark:bg-gray-800/90',
                'border-2 border-transparent',
                isActive && 'ring-2 ring-amber-500 dark:ring-amber-400 scale-105',
                'hover:scale-105 active:scale-95'
              )}
              style={{
                width: '72px',
                height: '72px',
              }}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={highlight.imageSrc}
                  alt={highlight.label}
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold text-center text-gray-800 dark:text-gray-200 leading-tight',
                  isActive && 'text-amber-700 dark:text-amber-300'
                )}
              >
                {highlight.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

