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
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Il Piatto del Giorno
        </h2>
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
