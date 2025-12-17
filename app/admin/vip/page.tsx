'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'
import Image from 'next/image'

interface VipItem {
  id: number
  imageUrl: string
  title: string | null
}

export default function AdminVip() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [vips, setVips] = useState<VipItem[]>([])
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<number | null>(null)
  const [titleValue, setTitleValue] = useState('')
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      loadVips()
    }
  }, [router])

  const loadVips = async () => {
    try {
      const response = await fetch('/api/vip')
      if (response.ok) {
        const data = await response.json()
        setVips(data)
      }
    } catch (error) {
      console.error('Error loading VIPs:', error)
    }
  }

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    try {
      const optimized = optimizeBase64Image(croppedImage)

      const response = await fetch('/api/vip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: optimized,
          title: titleValue || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio del VIP')
      }

      setCroppingImage(null)
      setTitleValue('')
      loadVips()
    } catch (error) {
      console.error('Error saving VIP:', error)
      alert('Errore nel salvataggio del VIP')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo VIP?')) {
      return
    }

    try {
      const response = await fetch(`/api/vip/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del VIP')
      }

      loadVips()
    } catch (error) {
      console.error('Error deleting VIP:', error)
      alert('Errore nell\'eliminazione del VIP')
    }
  }

  const handleUpdateTitle = async (id: number, title: string) => {
    try {
      const response = await fetch(`/api/vip/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || null }),
      })

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del titolo')
      }

      setEditingTitle(null)
      loadVips()
    } catch (error) {
      console.error('Error updating title:', error)
      alert('Errore nell\'aggiornamento del titolo')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Indietro</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Gestione VIP
        </h1>

        {/* Add New VIP */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Aggiungi Nuovo VIP
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titolo (opzionale)
              </label>
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="Nome del VIP o descrizione"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Immagine
              </label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <Upload size={24} className="text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">
                  Clicca per caricare un&apos;immagine
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* VIP List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vips.map((vip) => (
            <div
              key={vip.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative w-full h-64">
                {vip.imageUrl.startsWith('data:') || vip.imageUrl.startsWith('blob:') ? (
                  <img
                    src={vip.imageUrl}
                    alt={vip.title || 'VIP Guest'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={vip.imageUrl}
                    alt={vip.title || 'VIP Guest'}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                {editingTitle === vip.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      placeholder="Titolo"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleUpdateTitle(vip.id, titleValue)
                          setTitleValue('')
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Salva
                      </button>
                      <button
                        onClick={() => {
                          setEditingTitle(null)
                          setTitleValue('')
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vip.title || 'Senza titolo'}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTitle(vip.id)
                          setTitleValue(vip.title || '')
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Modifica Titolo
                      </button>
                      <button
                        onClick={() => handleDelete(vip.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Elimina
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {vips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Nessun VIP aggiunto. Aggiungi il primo VIP usando il form sopra.
            </p>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {croppingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ritaglia Immagine
              </h2>
              <button
                onClick={() => setCroppingImage(null)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <ImageCropper
              image={croppingImage}
              onCropComplete={handleCropComplete}
              onCancel={() => setCroppingImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

