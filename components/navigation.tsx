'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Menu as MenuIcon,
  X,
  Moon,
  Sun,
  ShoppingBag,
  Phone,
  MapPin,
  UtensilsCrossed,
  MessageCircle,
  Instagram,
  Facebook,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useCartStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

const navItems = [
  { href: '/menu', label: 'Menù' },
  { href: '/chi-siamo', label: 'Chi siamo' },
  { href: '/vip', label: 'Ospiti VIP' },
  { href: '/ecommerce', label: 'Shop' },
  { href: '/maps', label: 'Dove siamo' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function Navigation() {
  const pathname = usePathname() || '/'
  const { isDark, toggleTheme } = useThemeStore()
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Chiude il menu al cambio pagina
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Blocca lo scroll della pagina quando il menu mobile è aperto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-maiolica-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Vai al contenuto
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          'border-b bg-cream/90 backdrop-blur-md dark:bg-maiolica-950/85',
          scrolled || open
            ? 'border-cream-200/80 shadow-[0_6px_24px_-12px_rgba(16,31,61,0.18)] dark:border-white/10'
            : 'border-transparent'
        )}
      >
        <div className="container flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Trattoria Da Piero, home">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-cream-200 bg-white shadow-sm lg:h-11 lg:w-11">
              <Image src="/profilo.png" alt="" fill sizes="44px" className="object-cover" priority />
            </span>
            <span className="min-w-0 leading-none">
              <span className="block truncate font-serif text-lg font-semibold text-maiolica-900 dark:text-cream-50 lg:text-xl">
                Trattoria Da Piero
              </span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-arancia-600 dark:text-limone-300">
                Mondello · dal {site.since}
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principale">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors',
                    active
                      ? 'text-maiolica-800 dark:text-limone-300'
                      : 'text-ink-soft hover:text-maiolica-800 dark:text-cream-200/80 dark:hover:text-white'
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-limone-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-maiolica-700/5 hover:text-maiolica-800 dark:text-cream-200 dark:hover:bg-white/10"
              aria-label={isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {cartCount > 0 && (
              <Link
                href="/carrello"
                className="relative grid h-10 w-10 place-items-center rounded-full text-maiolica-800 transition hover:bg-maiolica-700/5 dark:text-cream-100 dark:hover:bg-white/10"
                aria-label={`Ordine al tavolo: ${cartCount} piatti`}
              >
                <ShoppingBag size={19} />
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-arancia-500 px-1 text-[0.7rem] font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            )}

            <a href={site.phone.href} className="btn-primary hidden !min-h-[40px] !py-2 lg:inline-flex">
              <Phone size={16} />
              Prenota
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-maiolica-900 transition hover:bg-maiolica-700/5 dark:text-cream-50 dark:hover:bg-white/10 lg:hidden"
              aria-label={open ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={open}
              aria-controls="menu-mobile"
            >
              {open ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile a tutto schermo */}
      <div
        id="menu-mobile"
        className={cn(
          'fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-cream transition-all duration-300 dark:bg-maiolica-950 lg:hidden',
          open ? 'visible opacity-100' : 'invisible -translate-y-2 opacity-0'
        )}
        aria-hidden={!open}
      >
        <div className="container flex min-h-full flex-col pb-[calc(var(--mobile-bar-h)+2rem)] pt-6">
          <nav aria-label="Menu mobile" className="flex flex-col">
            <Link
              href="/"
              className={cn(
                'border-b border-cream-200 py-4 font-serif text-3xl dark:border-white/10',
                pathname === '/' ? 'text-arancia-600 dark:text-limone-300' : 'text-maiolica-900 dark:text-cream-50'
              )}
            >
              Home
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'border-b border-cream-200 py-4 font-serif text-3xl dark:border-white/10',
                  isActivePath(pathname, item.href)
                    ? 'text-arancia-600 dark:text-limone-300'
                    : 'text-maiolica-900 dark:text-cream-50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <a href={site.phone.href} className="btn-primary">
              <Phone size={16} /> Chiama
            </a>
            <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>

          <div className="mt-auto pt-10 text-sm text-ink-soft dark:text-cream-200/70">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-arancia-500" />
              {site.address.full}
            </p>
            <div className="mt-4 flex gap-3">
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-cream-300 dark:border-white/15">
                <Instagram size={18} />
              </a>
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-cream-300 dark:border-white/15">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra azioni rapide (solo mobile/tablet) */}
      <nav
        aria-label="Azioni rapide"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-cream-200/80 bg-cream/95 backdrop-blur-md pb-safe dark:border-white/10 dark:bg-maiolica-950/95 lg:hidden"
      >
        <div className="mx-auto grid h-[var(--mobile-bar-h)] max-w-lg grid-cols-4">
          <QuickAction href="/menu" label="Menù" icon={UtensilsCrossed} active={isActivePath(pathname, '/menu')} />
          <QuickAction href={site.phone.href} label="Chiama" icon={Phone} external />
          <QuickAction href={site.whatsapp.href} label="WhatsApp" icon={MessageCircle} external newTab />
          <QuickAction href="/maps" label="Mappa" icon={MapPin} active={isActivePath(pathname, '/maps')} />
        </div>
      </nav>
    </>
  )
}

function QuickAction({
  href,
  label,
  icon: Icon,
  active,
  external,
  newTab,
}: {
  href: string
  label: string
  icon: LucideIcon
  active?: boolean
  external?: boolean
  newTab?: boolean
}) {
  const className = cn(
    'flex flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold tracking-wide transition-colors',
    active ? 'text-arancia-600 dark:text-limone-300' : 'text-maiolica-800 dark:text-cream-200'
  )
  const content = (
    <>
      <Icon size={21} />
      <span>{label}</span>
    </>
  )
  if (external) {
    return (
      <a
        href={href}
        className={className}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  )
}
