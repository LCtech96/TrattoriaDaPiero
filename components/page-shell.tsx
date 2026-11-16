import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Navigation } from './navigation'
import { Footer } from './footer'
import { cn } from '@/lib/utils'

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <Navigation />
      <main id="contenuto" className={cn('page-offset min-h-[70vh]', className)}>
        {children}
      </main>
      <Footer />
    </>
  )
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  crumbs?: { href: string; label: string }[]
  children?: React.ReactNode
  align?: 'center' | 'left'
}

export function PageHeader({ eyebrow, title, description, crumbs, children, align = 'center' }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-cream-200/80 dark:border-white/10">
      <div className="tile-band pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.06]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream dark:to-maiolica-950" aria-hidden />
      <div
        className={cn(
          'container relative py-10 sm:py-14 lg:py-16',
          align === 'center' ? 'text-center' : 'text-left'
        )}
      >
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="Percorso"
            className={cn(
              'mb-5 flex flex-wrap items-center gap-1 text-sm text-ink-muted dark:text-cream-200/60',
              align === 'center' && 'justify-center'
            )}
          >
            <Link href="/" className="hover:text-maiolica-700 dark:hover:text-white">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1">
                <ChevronRight size={14} aria-hidden />
                <Link href={c.href} className="hover:text-maiolica-700 dark:hover:text-white">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="display text-maiolica-900 dark:text-cream-50">{title}</h1>
        {description && (
          <div className={cn('lead mt-4 max-w-2xl', align === 'center' && 'mx-auto')}>{description}</div>
        )}
        {children}
      </div>
    </section>
  )
}
