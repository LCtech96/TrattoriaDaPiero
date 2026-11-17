'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'

interface SecurityEvent {
  id: number
  type: string
  ip: string | null
  detail: string | null
  createdAt: string
}

interface Summary {
  events: SecurityEvent[]
  stats: {
    failedLastHour: number
    failedLast24h: number
    blockedLast24h: number
    consecutiveFailures: number
  }
  alert: boolean
}

const LABELS: Record<string, { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }> = {
  login_success: { label: 'Accesso riuscito', tone: 'ok' },
  login_failed: { label: 'Accesso fallito', tone: 'warn' },
  login_rate_limited: { label: 'IP bloccato (troppi tentativi)', tone: 'bad' },
  login_locked: { label: 'Login sospeso (attacco distribuito)', tone: 'bad' },
  checkout_rate_limited: { label: 'Checkout bloccato (troppe richieste)', tone: 'bad' },
  webhook_bad_signature: { label: 'Webhook Stripe con firma non valida', tone: 'bad' },
  payment_amount_mismatch: { label: 'Importo pagato diverso dal totale', tone: 'bad' },
  upload_rejected: { label: 'Immagine rifiutata', tone: 'warn' },
  admin_delete: { label: 'Eliminazione', tone: 'info' },
  admin_payment: { label: 'Incasso manuale registrato', tone: 'info' },
}

const TONE: Record<string, string> = {
  ok: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  bad: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
}

export default function SecurityPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/security', { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'Registro non disponibile')
        setData(json)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} /> Torna al pannello
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sicurezza</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Accessi al pannello, blocchi automatici e operazioni importanti degli ultimi 90 giorni.
        </p>

        {error && <div className="rounded-lg bg-red-100 p-4 text-red-800">{error}</div>}

        {data && (
          <>
            <div
              className={`mb-6 flex items-start gap-3 rounded-lg p-4 ${
                data.alert
                  ? 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200'
                  : 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200'
              }`}
            >
              {data.alert ? <ShieldAlert className="shrink-0" /> : <ShieldCheck className="shrink-0" />}
              <p>
                {data.alert
                  ? 'Attività sospetta rilevata: controlla gli eventi qui sotto. Se non riconosci gli accessi, cambia la password admin.'
                  : 'Nessuna attività sospetta.'}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ['Accessi falliti di fila', data.stats.consecutiveFailures],
                ['Falliti ultima ora', data.stats.failedLastHour],
                ['Falliti ultime 24 ore', data.stats.failedLast24h],
                ['Blocchi ultime 24 ore', data.stats.blockedLast24h],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="p-3 font-medium">Quando</th>
                    <th className="p-3 font-medium">Evento</th>
                    <th className="p-3 font-medium">IP</th>
                    <th className="p-3 font-medium">Dettagli</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        Nessun evento registrato.
                      </td>
                    </tr>
                  )}
                  {data.events.map((event) => {
                    const meta = LABELS[event.type] ?? { label: event.type, tone: 'info' as const }
                    return (
                      <tr key={event.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                        <td className="whitespace-nowrap p-3 text-gray-700 dark:text-gray-300">
                          {new Date(event.createdAt).toLocaleString('it-IT')}
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[meta.tone]}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {event.ip ?? '—'}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{event.detail ?? ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
