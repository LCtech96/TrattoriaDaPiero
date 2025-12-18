'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'
import Image from 'next/image'

interface Post {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export default function AdminPosts() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [titleValue, setTitleValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      loadPosts()
    }
  }, [router])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
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

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: optimized,
          description: descriptionValue,
          title: titleValue || undefined
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio del post')
      }

      setCroppingImage(null)
      setTitleValue('')
      setDescriptionValue('')
      loadPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Errore nel salvataggio del post')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del post')
      }

      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Errore nell\'eliminazione del post')
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
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 mb-6 transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={18} />
          <span>Indietro</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Gestione Post
        </h1>

        {/* Add New Post */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Aggiungi Nuovo Post
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
                placeholder="Titolo del post"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrizione
              </label>
              <textarea
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                placeholder="Descrizione del piatto del giorno"
                rows={4}
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

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative w-full h-64 md:h-96">
                {post.imageUrl.startsWith('data:') || post.imageUrl.startsWith('blob:') ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title || post.description}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={post.imageUrl}
                    alt={post.title || post.description}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-4 md:p-6">
                {post.title && (
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h3>
                )}
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {post.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Elimina
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Nessun post disponibile. Aggiungi il primo post usando il form sopra.
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
