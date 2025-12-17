'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'
import Image from 'next/image'

export default function AdminGeneralImages() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [croppingType, setCroppingType] = useState<'cover' | 'profile' | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      loadImages()
    }
  }, [router])

  const loadImages = async () => {
    try {
      // Carica cover image
      const coverResponse = await fetch('/api/images/general?type=cover')
      if (coverResponse.ok) {
        const coverData = await coverResponse.json()
        if (coverData.imageUrl) {
          setCoverImage(coverData.imageUrl)
          localStorage.setItem('cover_image', coverData.imageUrl)
        }
      }
    } catch (error) {
      console.error('Error loading cover image:', error)
    }

    try {
      // Carica profile image
      const profileResponse = await fetch('/api/images/general?type=profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.imageUrl) {
          setProfileImage(profileData.imageUrl)
          localStorage.setItem('profile_image', profileData.imageUrl)
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error)
    }
  }

  const handleFileSelect = (type: 'cover' | 'profile', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
      setCroppingType(type)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppingType) return

    try {
      const optimized = optimizeBase64Image(croppedImage)

      const response = await fetch('/api/images/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: croppingType,
          imageUrl: optimized 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio dell\'immagine')
      }

      // Update local state
      if (croppingType === 'cover') {
        setCoverImage(optimized)
        localStorage.setItem('cover_image', optimized)
      } else {
        setProfileImage(optimized)
        localStorage.setItem('profile_image', optimized)
      }

      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('storage'))

      // Reset
      setCroppingImage(null)
      setCroppingType(null)

      alert(`Immagine ${croppingType === 'cover' ? 'di copertina' : 'del profilo'} caricata con successo!`)
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Errore nel caricamento dell\'immagine. Riprova più tardi.')
    }
  }

  const handleCancelCrop = () => {
    setCroppingImage(null)
    setCroppingType(null)
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
          <span>Torna al pannello</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Immagini Generali
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine di Copertina
            </h2>
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {coverImage ? (
                  coverImage.startsWith('data:') || coverImage.startsWith('blob:') ? (
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Image
                      src={coverImage}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Nessuna immagine caricata
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect('cover', file)
                  }}
                  className="hidden"
                  id="cover-image"
                />
                <label
                  htmlFor="cover-image"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Carica e ritaglia immagine
                </label>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine del Profilo
            </h2>
            <div className="space-y-4">
              <div className="relative w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {profileImage ? (
                  profileImage.startsWith('data:') || profileImage.startsWith('blob:') ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Nessuna immagine
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect('profile', file)
                  }}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Carica e ritaglia immagine
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {croppingImage && (
        <ImageCropper
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={croppingType === 'profile' ? 1 : undefined}
        />
      )}
    </div>
  )
}
