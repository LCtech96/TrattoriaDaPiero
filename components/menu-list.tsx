'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { menuItems, categories, type MenuItem } from '@/data/menu-data'
import { MenuItemCard } from './menu-item-card'

function matchesSearch(item: MenuItem, query: string, categoryName: string) {
  const haystack = [
    item.name,
    item.description,
    categoryName,
    ...item.ingredients,
    ...item.allergens,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export function MenuList() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    []
  )

  const visibleItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === null || item.categoryId === selectedCategory
      const matchesText =
        normalizedQuery === '' ||
        matchesSearch(item, normalizedQuery, categoryById.get(item.categoryId) ?? '')

      return matchesCategory && matchesText
    })
  }, [categoryById, normalizedQuery, selectedCategory])

  const itemsByCategory = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: visibleItems.filter((item) => item.categoryId === category.id),
      }))
      .filter(({ items }) => items.length > 0)
  }, [visibleItems])

  const hasResults = visibleItems.length > 0

  return (
    <div className="space-y-6">
      <div className="content-surface p-4 md:p-5 space-y-4">
        <label htmlFor="menu-search" className="sr-only">
          Cerca piatti, bevande o ingredienti
        </label>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
            aria-hidden
          />
          <input
            id="menu-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cerca piatti, bevande o ingredienti..."
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Cancella ricerca"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/90 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Tutti
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/90 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {normalizedQuery && (
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            {hasResults
              ? `${visibleItems.length} risultat${visibleItems.length === 1 ? 'o' : 'i'} per "${searchQuery.trim()}"`
              : `Nessun risultato per "${searchQuery.trim()}"`}
          </p>
        )}
      </div>

      {!hasResults ? (
        <div className="content-surface p-8 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nessun piatto trovato
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Prova con un altro termine o seleziona una categoria diversa.
          </p>
        </div>
      ) : selectedCategory === null ? (
        itemsByCategory.map(({ category, items }) => (
          <div key={category.id} className="content-surface p-4 md:p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="content-surface p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
