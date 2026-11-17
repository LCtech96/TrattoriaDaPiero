'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight } from 'lucide-react'
import { menuItems, categories, type MenuItem } from '@/data/menu-data'
import { MenuItemCard } from './menu-item-card'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, cn } from '@/lib/utils'

function matchesSearch(item: MenuItem, query: string, categoryName: string) {
  return [item.name, item.description, categoryName, ...item.ingredients, ...item.allergens]
    .join(' ')
    .toLowerCase()
    .includes(query)
}

const slug = (id: number) => `categoria-${id}`

export function MenuList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id ?? 0)
  const chipsRef = useRef<HTMLDivElement>(null)
  const [imageIds, setImageIds] = useState<Set<number>>(new Set())
  const { items: cartItems, getTotal } = useCartStore()

  useEffect(() => {
    let cancelled = false
    fetch('/api/images/menu-items')
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.ids)) setImageIds(new Set(data.ids))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const groups = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        category,
        items: menuItems.filter(
          (item) =>
            item.categoryId === category.id &&
            (normalizedQuery === '' || matchesSearch(item, normalizedQuery, category.name))
        ),
      }))
      .filter(({ items }) => items.length > 0)
  }, [normalizedQuery])

  const resultCount = groups.reduce((n, g) => n + g.items.length, 0)

  // Evidenzia la categoria visibile durante lo scroll
  useEffect(() => {
    const sections = groups
      .map((g) => document.getElementById(slug(g.category.id)))
      .filter(Boolean) as HTMLElement[]
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          setActiveCategory(Number(top.target.getAttribute('data-category')))
        }
      },
      { rootMargin: '-180px 0px -55% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [groups])

  // Tiene il chip attivo visibile nella barra orizzontale
  useEffect(() => {
    const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-chip="${activeCategory}"]`)
    if (chip && chipsRef.current) {
      const bar = chipsRef.current
      bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
    }
  }, [activeCategory])

  const goTo = (id: number) => {
    setActiveCategory(id)
    const el = document.getElementById(slug(id))
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 150
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div>
      {/* Barra ricerca + categorie, fissa sotto l'header */}
      <div className="sticky top-[var(--header-h)] z-30 -mx-4 border-b border-cream-200/80 bg-cream/95 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-maiolica-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <label htmlFor="menu-search" className="sr-only">
            Cerca piatti, bevande o ingredienti
          </label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              id="menu-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca un piatto, una bevanda…"
              className="input !rounded-full !pl-11 !pr-11"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-cream-100 dark:hover:bg-white/10"
                aria-label="Cancella ricerca"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div ref={chipsRef} className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {groups.map(({ category }) => (
              <button
                key={category.id}
                data-chip={category.id}
                onClick={() => goTo(category.id)}
                className={cn('chip', activeCategory === category.id && 'chip-active')}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl pt-6">
        {normalizedQuery && (
          <p className="mb-4 text-center text-sm text-ink-soft dark:text-cream-200/70" aria-live="polite">
            {resultCount > 0
              ? `${resultCount} risultat${resultCount === 1 ? 'o' : 'i'} per “${searchQuery.trim()}”`
              : ''}
          </p>
        )}

        {resultCount === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <p className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">Nessun piatto trovato</p>
            <p className="mt-2 text-ink-soft dark:text-cream-200/70">Prova con un altro termine.</p>
            <button onClick={() => setSearchQuery('')} className="btn-outline mt-6">
              Mostra tutto il menù
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {groups.map(({ category, items }) => (
              <section
                key={category.id}
                id={slug(category.id)}
                data-category={category.id}
                aria-labelledby={`${slug(category.id)}-title`}
              >
                <div className="mb-3 flex items-center gap-4 px-3 sm:px-4">
                  <h2 id={`${slug(category.id)}-title`} className="font-serif text-3xl text-maiolica-900 dark:text-cream-50 sm:text-4xl">
                    {category.name}
                  </h2>
                  <span className="h-px flex-1 bg-gradient-to-r from-limone-400 to-transparent" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted dark:text-cream-200/50">
                    {items.length}
                  </span>
                </div>
                <div className="divide-y divide-cream-200/80 dark:divide-white/5">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} hasImage={imageIds.has(item.id)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Riepilogo ordine fluttuante */}
      {cartCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+0.75rem)] z-40 px-4 lg:bottom-6">
          <Link
            href="/carrello"
            className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-full bg-maiolica-800 py-2 pl-2 pr-5 text-cream-50 shadow-lift transition hover:bg-maiolica-900 dark:bg-limone-400 dark:text-maiolica-950"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-limone-400 font-bold text-maiolica-950 dark:bg-maiolica-900 dark:text-limone-300">
              {cartCount}
            </span>
            <span className="flex-1 text-sm font-semibold">Vedi il tuo ordine</span>
            <span className="font-semibold tabular-nums">{formatPrice(getTotal())}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
