'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'


interface Post {
  id: string
  imageUrl: string
  description: string
  title?: string
  createdAt: string
}

export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Nessun post disponibile al momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Show cooking section */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/3 h-52 md:h-60 bg-black">
              <Image
                src="/show-coocking.png"
                alt="Show cooking di Piero Giammanco"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-amber-200 dark:text-white mb-2">
                Show cooking a vista
              </h3>
              <p className="text-sm md:text-base text-amber-200 dark:text-gray-300 leading-relaxed">
                Nello spazio esterno del ristorante, Piero – il titolare – cucina a vista per i suoi
                ospiti, diventando un vero punto di riferimento. Con lo show cooking regala
                bellissime esperienze e condivide le sue ricette direttamente davanti ai clienti.
              </p>
            </div>
          </div>
        </section>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-amber-200 dark:text-white">
          Il post del giorno
        </h2>
        {posts[0] && (
          <p className="text-center text-xs md:text-sm text-amber-200/90 dark:text-gray-400 mb-6">
            Data di pubblicazione: {new Date(posts[0].createdAt).toLocaleDateString('it-IT')}
          </p>
        )}
        <div className="space-y-8">
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
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
