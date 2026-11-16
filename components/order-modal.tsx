'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import { whatsappLink } from '@/lib/site'
import { Sheet } from './sheet'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
}

type FieldKey = 'tableNumber' | 'name' | 'surname' | 'deliveryTime' | 'address' | 'houseNumber' | 'phone'

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const { items, getTotal, clearCart } = useCartStore()
  const [orderType, setOrderType] = useState<'table' | 'takeaway'>('table')
  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    tableNumber: '',
    name: '',
    surname: '',
    deliveryTime: '',
    address: '',
    houseNumber: '',
    phone: '',
  })

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  const isValid =
    orderType === 'table'
      ? Boolean(formData.tableNumber && formData.name && formData.surname)
      : Boolean(formData.name && formData.surname && formData.phone && formData.address && formData.houseNumber)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    let message = `*Nuovo Ordine - ${orderType === 'table' ? 'Al Tavolo' : 'Da Asporto'}*\n\n`

    items.forEach((item) => {
      message += `*${item.name}* x${item.quantity}\n`
      if (item.addedIngredients.length > 0) message += `  + ${item.addedIngredients.join(', ')}\n`
      if (item.removedIngredients.length > 0) message += `  - ${item.removedIngredients.join(', ')}\n`
      message += `  ${formatPrice(item.price * item.quantity)}\n\n`
    })

    message += `*Totale: ${formatPrice(getTotal())}*\n\n`

    if (orderType === 'table') {
      message += `*Dati Cliente:*\n`
      message += `Nome: ${formData.name} ${formData.surname}\n`
      message += `Tavolo: ${formData.tableNumber}\n`
    } else {
      message += `*Dati Consegna:*\n`
      message += `Nome: ${formData.name} ${formData.surname}\n`
      message += `Indirizzo: ${formData.address}, ${formData.houseNumber}\n`
      message += `Telefono: ${formData.phone}\n`
      if (formData.deliveryTime) message += `Orario preferito: ${formData.deliveryTime}\n`
    }

    window.open(whatsappLink(message), '_blank')
    clearCart()
    onClose()
  }

  const field = (key: FieldKey, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="label">{label}</span>
      <input value={formData[key]} onChange={set(key)} className="input" {...props} />
    </label>
  )

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title="Completa l'ordine"
      subtitle={`Totale ${formatPrice(getTotal())}`}
      footer={
        <button type="submit" form="order-form" disabled={!isValid} className="btn-primary w-full">
          <MessageCircle size={17} /> Invia ordine via WhatsApp
        </button>
      }
    >
      <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
        <div role="radiogroup" aria-label="Tipo di ordine" className="grid grid-cols-2 gap-1 rounded-full bg-cream-100 p-1 dark:bg-maiolica-950/60">
          {(
            [
              ['table', 'Al tavolo'],
              ['takeaway', 'Da asporto'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={orderType === value}
              onClick={() => setOrderType(value)}
              className={cn(
                'min-h-[44px] rounded-full text-sm font-semibold transition',
                orderType === value
                  ? 'bg-cream-50 text-maiolica-900 shadow-soft dark:bg-maiolica-800 dark:text-cream-50'
                  : 'text-ink-soft dark:text-cream-200/70'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {orderType === 'table' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{field('tableNumber', 'Numero tavolo *', { required: true, inputMode: 'numeric', placeholder: 'Es. 5' })}</div>
            {field('name', 'Nome *', { required: true, autoComplete: 'given-name' })}
            {field('surname', 'Cognome *', { required: true, autoComplete: 'family-name' })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Nome *', { required: true, autoComplete: 'given-name' })}
            {field('surname', 'Cognome *', { required: true, autoComplete: 'family-name' })}
            <div className="sm:col-span-2">{field('phone', 'Telefono *', { required: true, type: 'tel', autoComplete: 'tel' })}</div>
            {field('address', 'Indirizzo *', { required: true, autoComplete: 'address-line1' })}
            {field('houseNumber', 'Numero civico *', { required: true })}
            <div className="sm:col-span-2">{field('deliveryTime', 'Orario preferito', { type: 'time' })}</div>
          </div>
        )}

        <div className="rounded-2xl bg-cream-100 p-4 dark:bg-maiolica-950/50">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted dark:text-cream-200/60">
            Riepilogo
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="truncate text-ink-soft dark:text-cream-200/80">
                  {item.quantity}× {item.name}
                </span>
                <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </Sheet>
  )
}
