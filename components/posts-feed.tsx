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

/** Novità pubblicate dall'admin. Se non ci sono post la sezione non compare. */
export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/posts')
      .then((res) => (res.ok ? res.json() : { posts: [] }))
      .then((data) => {
        if (!cancelled) setPosts(Array.isArray(data.posts) ? data.posts : [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="section bg-cream-100/70 dark:bg-maiolica-900/40" aria-labelledby="novita">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Dalla cucina</p>
          <h2 id="novita" className="heading text-maiolica-900 dark:text-cream-50">
            Il post del giorno
          </h2>
          <p className="mt-3 text-sm text-ink-muted dark:text-cream-200/60">
            Pubblicato il {new Date(posts[0].createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className={`card overflow-hidden ${i === 0 && posts.length % 2 === 1 ? 'md:col-span-2 md:grid md:grid-cols-2' : ''}`}
            >
              <div className="relative aspect-[4/3] w-full bg-cream-200 dark:bg-maiolica-950">
                {post.imageUrl.startsWith('data:') || post.imageUrl.startsWith('blob:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt={post.title || post.description}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={post.imageUrl}
                    alt={post.title || post.description}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                {post.title && (
                  <h3 className="font-serif text-2xl text-maiolica-900 dark:text-cream-50">{post.title}</h3>
                )}
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft dark:text-cream-200/80">
                  {post.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
