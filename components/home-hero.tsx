'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { EditableText } from './editable-text'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function HomeHero() {
  const [restaurantName, setRestaurantName] = useState('Trattoria Da Piero')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Specialità Mondello')
  // Immagini di default prese dalla cartella public
  const [coverImage, setCoverImage] = useState('/copertina.png')
  const [profileImage, setProfileImage] = useState('/profilo.png')
  const coverBlobUrlRef = useRef<string | null>(null)
  const profileBlobUrlRef = useRef<string | null>(null)

  const normalizeCover = (url: string) => {
    if (!url || url === '/cover-image.png') return '/copertina.png'
    return url
  }

  const normalizeProfile = (url: string) => {
    if (!url || url === '/profile-image.png') return '/profilo.png'
    return url
  }

  const loadImages = async () => {
    try {
      // Carica cover image dal database
      const coverResponse = await fetch('/api/images/general?type=cover')
      if (coverResponse.ok) {
        const coverData = await coverResponse.json()
        if (coverData.imageUrl) {
          const savedCover = normalizeCover(coverData.imageUrl)
          localStorage.setItem('cover_image', savedCover)
          
          if (isAndroid() && savedCover.startsWith('data:image')) {
            const blobUrl = base64ToBlobUrl(savedCover)
            if (blobUrl) {
              if (coverBlobUrlRef.current) {
                URL.revokeObjectURL(coverBlobUrlRef.current)
              }
              coverBlobUrlRef.current = blobUrl
              setCoverImage(blobUrl)
            } else {
              setCoverImage(savedCover)
            }
          } else {
            setCoverImage(savedCover)
          }
        }
      }
    } catch (error) {
      console.error('Error loading cover image:', error)
      // Fallback a localStorage
      const savedCover = localStorage.getItem('cover_image')
      if (savedCover) {
        if (isAndroid() && savedCover.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedCover)
          if (blobUrl) {
            if (coverBlobUrlRef.current) {
              URL.revokeObjectURL(coverBlobUrlRef.current)
            }
            coverBlobUrlRef.current = blobUrl
            setCoverImage(blobUrl)
          } else {
            setCoverImage(normalizeCover(savedCover))
          }
        } else {
          setCoverImage(normalizeCover(savedCover))
        }
      }
    }

    try {
      // Carica profile image dal database
      const profileResponse = await fetch('/api/images/general?type=profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.imageUrl) {
          const savedProfile = normalizeProfile(profileData.imageUrl)
          localStorage.setItem('profile_image', savedProfile)
          
          if (isAndroid() && savedProfile.startsWith('data:image')) {
            const blobUrl = base64ToBlobUrl(savedProfile)
            if (blobUrl) {
              if (profileBlobUrlRef.current) {
                URL.revokeObjectURL(profileBlobUrlRef.current)
              }
              profileBlobUrlRef.current = blobUrl
              setProfileImage(blobUrl)
            } else {
              setProfileImage(savedProfile)
            }
          } else {
            setProfileImage(savedProfile)
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error)
      // Fallback a localStorage
      const savedProfile = localStorage.getItem('profile_image')
      if (savedProfile) {
        if (isAndroid() && savedProfile.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedProfile)
          if (blobUrl) {
            if (profileBlobUrlRef.current) {
              URL.revokeObjectURL(profileBlobUrlRef.current)
            }
            profileBlobUrlRef.current = blobUrl
            setProfileImage(blobUrl)
          } else {
            setProfileImage(normalizeProfile(savedProfile))
          }
        } else {
          setProfileImage(normalizeProfile(savedProfile))
        }
      }
    }
  }

  useEffect(() => {
    const savedName = localStorage.getItem('content_restaurant_name')
    const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
    
    if (savedName) setRestaurantName(savedName)
    if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
    
    loadImages().catch(console.error)
  }, [])

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedName = localStorage.getItem('content_restaurant_name')
      const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
      
      if (savedName) setRestaurantName(savedName)
      if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
      
      loadImages().catch(console.error)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      // Pulisci blob URL quando il componente viene smontato
      if (coverBlobUrlRef.current) {
        URL.revokeObjectURL(coverBlobUrlRef.current)
      }
      if (profileBlobUrlRef.current) {
        URL.revokeObjectURL(profileBlobUrlRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
        {coverImage.startsWith('data:') ? (
          <img
            src={coverImage}
            alt="Trattoria Da Piero - Copertina"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Error loading cover image')
              e.currentTarget.src = '/copertina.png'
            }}
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Image
            src={coverImage}
            alt="Trattoria Da Piero - Copertina"
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-28 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          {/* Restaurant Info */}
          <div className="flex-1 pb-1 md:pb-2 order-2 md:order-1">
            <EditableText
              value={restaurantName}
              onSave={(v) => {
                setRestaurantName(v)
                localStorage.setItem('content_restaurant_name', v)
                // Trigger custom event for same-tab updates
                window.dispatchEvent(new Event('storage'))
              }}
              tag="h1"
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2"
            />
            <EditableText
              value={restaurantSubtitle}
              onSave={(v) => {
                setRestaurantSubtitle(v)
                localStorage.setItem('content_restaurant_subtitle', v)
                // Trigger custom event for same-tab updates
                window.dispatchEvent(new Event('storage'))
              }}
              tag="p"
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1"
            />
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              Il tuo punto di riferimento tra i ristoranti a Mondello.
            </p>
          </div>
          
          {/* Profile Image */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-lg order-1 md:order-2">
            {profileImage.startsWith('data:') ? (
              <img
                src={profileImage}
                alt="Trattoria Da Piero - Profilo"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Error loading profile image')
                  e.currentTarget.src = '/profilo.png'
                }}
                style={{ 
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Image
                src={profileImage}
                alt="Trattoria Da Piero - Profilo"
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
