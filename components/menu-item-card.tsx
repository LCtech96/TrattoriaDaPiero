'use client'

import { useState, useEffect, useRef } from 'react'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice, base64ToBlobUrl, isAndroid } from '@/lib/utils'
import { MenuItemModal } from './menu-item-modal'
import { Star, Leaf, WheatOff, Plus } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
}

/** Foto del piatto caricata dall'admin: database -> cache localStorage. */
function useMenuItemImage(itemId: number) {
  const [image, setImage] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const apply = (url: string | null) => {
      if (url && isAndroid() && url.startsWith('data:image')) {
        const blobUrl = base64ToBlobUrl(url)
        if (blobUrl) {
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = blobUrl
          setImage(blobUrl)
          return
        }
      }
      setImage(url)
    }

    const load = async () => {
      try {
        const response = await fetch(`/api/images/menu-items/${itemId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            localStorage.setItem(`item_image_${itemId}`, data.imageUrl)
            apply(data.imageUrl)
            return
          }
        }
      } catch {
        // si usa la cache
      }
      apply(localStorage.getItem(`item_image_${itemId}`))
    }

    const handleImageUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.itemId === itemId) apply(detail.imageUrl)
    }

    load()
    window.addEventListener('storage', load)
    window.addEventListener('imageUpdated', handleImageUpdate as EventListener)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('imageUpdated', handleImageUpdate as EventListener)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [itemId])

  return [image, setImage] as const
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemImage, setItemImage] = useMenuItemImage(item.id)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:bg-cream-100 dark:hover:bg-white/5 sm:p-4"
      >
        {itemImage && (
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-200 dark:bg-maiolica-950 sm:h-24 sm:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={itemImage}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setItemImage(null)}
            />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-3">
            <span className="font-serif text-lg leading-snug text-maiolica-900 dark:text-cream-50 sm:text-xl">
              {item.name}
              {(item.isBestSeller || item.isVegan || item.isGlutenFree) && (
                <span className="ml-2 inline-flex translate-y-0.5 gap-1 align-baseline">
                  {item.isBestSeller && <Star size={15} className="fill-limone-400 text-limone-500" aria-label="Best seller" />}
                  {item.isVegan && <Leaf size={15} className="text-emerald-600" aria-label="Vegano" />}
                  {item.isGlutenFree && <WheatOff size={15} className="text-maiolica-500" aria-label="Senza glutine" />}
                </span>
              )}
            </span>
            <span className="hidden min-w-[1.5rem] flex-1 translate-y-[-0.3rem] border-b border-dotted border-cream-300 dark:border-white/20 sm:block" aria-hidden />
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-arancia-600 dark:text-limone-300 sm:ml-0">
              {formatPrice(item.price)}
            </span>
          </span>
          {item.description && (
            <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-soft dark:text-cream-200/70">
              {item.description}
            </span>
          )}
        </span>

        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream-300 text-maiolica-700 transition group-hover:border-maiolica-700 group-hover:bg-maiolica-700 group-hover:text-cream-50 dark:border-white/15 dark:text-cream-100 dark:group-hover:border-limone-400 dark:group-hover:bg-limone-400 dark:group-hover:text-maiolica-950"
          aria-hidden
        >
          <Plus size={16} />
        </span>
      </button>

      {isModalOpen && (
        <MenuItemModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={itemImage}
        />
      )}
    </>
  )
}
