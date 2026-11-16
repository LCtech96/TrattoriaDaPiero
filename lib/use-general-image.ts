'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

type GeneralImageType = 'cover' | 'profile'

const config: Record<GeneralImageType, { storageKey: string; fallback: string; legacy: string }> = {
  cover: { storageKey: 'cover_image', fallback: '/copertina.png', legacy: '/cover-image.png' },
  profile: { storageKey: 'profile_image', fallback: '/profilo.png', legacy: '/profile-image.png' },
}

/**
 * Carica un'immagine "generale" (copertina o profilo) impostata dall'admin.
 * Ordine: database -> cache localStorage -> immagine di default in /public.
 * Su Android le immagini base64 vengono convertite in blob URL (più affidabili).
 */
export function useGeneralImage(type: GeneralImageType) {
  const { storageKey, fallback, legacy } = config[type]
  const [src, setSrc] = useState<string>(fallback)
  const blobRef = useRef<string | null>(null)

  const apply = useCallback(
    (raw: string | null | undefined) => {
      const url = !raw || raw === legacy ? fallback : raw
      if (isAndroid() && url.startsWith('data:image')) {
        const blobUrl = base64ToBlobUrl(url)
        if (blobUrl) {
          if (blobRef.current) URL.revokeObjectURL(blobRef.current)
          blobRef.current = blobUrl
          setSrc(blobUrl)
          return
        }
      }
      setSrc(url)
    },
    [fallback, legacy]
  )

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/images/general?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        if (data.imageUrl) {
          localStorage.setItem(storageKey, data.imageUrl)
          apply(data.imageUrl)
          return
        }
      }
    } catch {
      // ignora: si usa la cache
    }
    const cached = localStorage.getItem(storageKey)
    if (cached) apply(cached)
  }, [apply, storageKey, type])

  useEffect(() => {
    load()
    const onChange = () => load()
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('storage', onChange)
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    }
  }, [load])

  return { src, fallback }
}
