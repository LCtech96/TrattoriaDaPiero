'use client'

import { useState } from 'react'
import { Plus, Minus, Leaf, Star, WheatOff } from 'lucide-react'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { Sheet } from './sheet'

interface MenuItemModalProps {
  item: MenuItem
  isOpen: boolean
  onClose: () => void
  imageUrl?: string | null
}

// Ingredienti comuni che si possono aggiungere
const availableAdditions = [
  'pomodoro',
  'mozzarella',
  'basilico',
  'olio di oliva',
  'aglio',
  'pepe',
  'prezzemolo',
  'rucola',
  'grana',
  'pistacchio',
  'panna',
]

export function MenuItemModal({ item, isOpen, onClose, imageUrl }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [addedIngredients, setAddedIngredients] = useState<string[]>([])
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      addedIngredients,
      removedIngredients,
    })
    onClose()
    setQuantity(1)
    setRemovedIngredients([])
    setAddedIngredients([])
  }

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value])

  const canAddIngredients = availableAdditions.filter((ing) => !item.ingredients.includes(ing))

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={item.name}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-arancia-600 dark:text-limone-300">{formatPrice(item.price)}</span>
          {item.isBestSeller && (
            <span className="inline-flex items-center gap-1"><Star size={14} className="fill-limone-400 text-limone-500" /> Best seller</span>
          )}
          {item.isVegan && <span className="inline-flex items-center gap-1"><Leaf size={14} className="text-emerald-600" /> Vegano</span>}
          {item.isGlutenFree && <span className="inline-flex items-center gap-1"><WheatOff size={14} className="text-maiolica-500" /> Senza glutine</span>}
        </span>
      }
      footer={
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-cream-300 dark:border-white/15">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="grid h-11 w-11 place-items-center rounded-full text-maiolica-800 hover:bg-maiolica-700/5 dark:text-cream-100"
              aria-label="Diminuisci quantità"
            >
              <Minus size={18} />
            </button>
            <span className="w-8 text-center text-lg font-semibold tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="grid h-11 w-11 place-items-center rounded-full text-maiolica-800 hover:bg-maiolica-700/5 dark:text-cream-100"
              aria-label="Aumenta quantità"
            >
              <Plus size={18} />
            </button>
          </div>
          <button onClick={handleAddToCart} className="btn-primary flex-1 justify-between !px-5">
            <span>Aggiungi</span>
            <span className="tabular-nums">{formatPrice(item.price * quantity)}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {imageUrl && (
          <div className="relative -mx-5 -mt-5 aspect-[16/10] overflow-hidden bg-cream-200 sm:mx-0 sm:mt-0 sm:rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
          </div>
        )}

        {item.description && (
          <p className="leading-relaxed text-ink-soft dark:text-cream-200/80">{item.description}</p>
        )}

        {item.allergens.length > 0 && (
          <p className="rounded-xl bg-limone-100 px-4 py-3 text-sm text-maiolica-900 dark:bg-limone-400/10 dark:text-limone-200">
            <span className="font-semibold">Allergeni:</span> {item.allergens.join(', ')}
          </p>
        )}

        {item.ingredients.length > 0 && (
          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted dark:text-cream-200/60">
              Ingredienti
            </h3>
            <p className="mt-1 text-xs text-ink-muted dark:text-cream-200/50">Tocca per toglierne uno</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.ingredients.map((ing) => {
                const removed = removedIngredients.includes(ing)
                return (
                  <button
                    key={ing}
                    onClick={() => toggle(removedIngredients, setRemovedIngredients, ing)}
                    aria-pressed={removed}
                    className={cn(
                      'chip !min-h-[36px] !px-3',
                      removed && '!border-red-300 !bg-red-50 !text-red-700 line-through dark:!border-red-400/40 dark:!bg-red-500/10 dark:!text-red-300'
                    )}
                  >
                    {ing}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {canAddIngredients.length > 0 && (
          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted dark:text-cream-200/60">
              Aggiungi
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {canAddIngredients.map((ing) => {
                const added = addedIngredients.includes(ing)
                return (
                  <button
                    key={ing}
                    onClick={() => toggle(addedIngredients, setAddedIngredients, ing)}
                    aria-pressed={added}
                    className={cn(
                      'chip !min-h-[36px] !px-3',
                      added && '!border-emerald-400 !bg-emerald-50 !text-emerald-800 dark:!border-emerald-400/40 dark:!bg-emerald-500/10 dark:!text-emerald-300'
                    )}
                  >
                    {added ? '✓' : '+'} {ing}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}
