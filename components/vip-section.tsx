'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { staticVips, type VipItem } from './vip-data'

function VipImage({ vip, sizes, className }: { vip: VipItem; sizes: string; className: string }) {
  if (!vip.imageUrl.startsWith('/') || vip.imageUrl.startsWith('//')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={vip.imageUrl} alt={vip.title || 'Ospite VIP'} className={`absolute inset-0 h-full w-full ${className}`} loading="lazy" />
    )
  }
  return <Image src={vip.imageUrl} alt={vip.title || 'Ospite VIP'} fill sizes={sizes} className={className} />
}

export function VipSection() {
  const [vips, setVips] = useState<VipItem[]>(staticVips)
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/vip')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setVips([...staticVips, ...data])
      })
      .catch(() => {})
  }, [])

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (dir: number) => setIndex((i) => (i === null ? i : (i + dir + vips.length) % vips.length)),
    [vips.length]
  )

  useEffect(() => {
    if (index === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [index, close, step])

  const selected = index !== null ? vips[index] : null

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {vips.map((vip, i) => (
          <li key={vip.id ?? vip.title ?? vip.imageUrl} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-maiolica-900 text-left shadow-soft"
            >
              <div className={`relative w-full ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'}`}>
                <VipImage
                  vip={vip}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maiolica-950/85 via-transparent to-transparent" />
              </div>
              {vip.title && (
                <p className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium leading-snug text-cream-50 sm:p-4 sm:text-sm">
                  {vip.title}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>

      {selected &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-maiolica-950/95 backdrop-blur" role="dialog" aria-modal="true" aria-label={selected.title ?? 'Ospite VIP'}>
            <div className="flex items-center justify-between px-4 py-3 text-cream-100 sm:px-6">
              <span className="text-sm tabular-nums text-cream-200/70">
                {(index ?? 0) + 1} / {vips.length}
              </span>
              <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Chiudi">
                <X size={24} />
              </button>
            </div>
            <div className="relative flex-1" onClick={close}>
              <VipImage vip={selected} sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center gap-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
              <button onClick={() => step(-1)} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-cream-50 hover:bg-white/10" aria-label="Precedente">
                <ChevronLeft size={22} />
              </button>
              <p className="flex-1 text-center font-serif text-lg text-cream-50 sm:text-xl">{selected.title}</p>
              <button onClick={() => step(1)} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-cream-50 hover:bg-white/10" aria-label="Successivo">
                <ChevronRight size={22} />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
