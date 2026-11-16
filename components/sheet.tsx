'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * Finestra modale: pannello dal basso su smartphone, finestra centrata da tablet in su.
 * Chiude con Esc, click sullo sfondo o pulsante X e blocca lo scroll della pagina.
 */
export function Sheet({ open, onClose, title, subtitle, children, footer, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-maiolica-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92svh] w-full animate-sheet-up flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-lift outline-none dark:bg-maiolica-900 sm:max-w-xl sm:animate-fade-up sm:rounded-3xl',
          className
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-cream-300 dark:bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4 border-b border-cream-200 px-5 pb-4 pt-3 dark:border-white/10 sm:px-7 sm:pt-6">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl leading-tight text-maiolica-900 dark:text-cream-50">{title}</h2>
            {subtitle && <div className="mt-1 text-sm text-ink-soft dark:text-cream-200/70">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-maiolica-700/5 dark:text-cream-200 dark:hover:bg-white/10"
            aria-label="Chiudi"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">{children}</div>
        {footer && (
          <div className="border-t border-cream-200 bg-cream-50 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-maiolica-900 sm:px-7 sm:pb-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
