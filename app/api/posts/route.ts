import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedJson, purgePublicCache } from '@/lib/public-cache'
import { requireAdmin } from '@/lib/require-admin'
import { optionalText, validateImage } from '@/lib/image-validation'
import { logSecurityEvent } from '@/lib/security'

export const runtime = 'nodejs'

interface PostRow {
  id: number
  imageUrl: string
  description: string
  title: string | null
  createdAt: Date
}

const toJson = (post: PostRow) => ({
  id: post.id.toString(),
  imageUrl: post.imageUrl,
  description: post.description,
  title: post.title || undefined,
  createdAt: post.createdAt.toISOString(),
})

const select = { id: true, imageUrl: true, description: true, title: true, createdAt: true }

// GET - Elenco dei post (pubblico)
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }
    const posts: PostRow[] = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 50, select })
    return cachedJson({ posts: posts.map(toJson) }, 'posts')
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Errore nel recupero dei post' }, { status: 500 })
  }
}

// POST - Crea un post (solo admin)
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json().catch(() => null)

    const image = validateImage(body?.imageUrl)
    if (!image.ok) {
      await logSecurityEvent('upload_rejected', request, `post: ${image.error}`)
      return NextResponse.json({ error: image.error }, { status: 400 })
    }

    const description = optionalText(body?.description, 5000)
    if (!description.ok || !description.value) {
      return NextResponse.json(
        { error: description.ok ? 'Descrizione obbligatoria' : description.error },
        { status: 400 }
      )
    }

    const title = optionalText(body?.title, 200)
    if (!title.ok) {
      return NextResponse.json({ error: title.error }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    const post: PostRow = await prisma.post.create({
      data: { imageUrl: image.value!, description: description.value, title: title.value },
      select,
    })
    await purgePublicCache('posts')
    return NextResponse.json({ success: true, post: toJson(post) })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Errore nella creazione del post' }, { status: 500 })
  }
}

// DELETE - Elimina un post (solo admin)
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const id = Number.parseInt(request.nextUrl.searchParams.get('id') ?? '', 10)
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'ID post non valido' }, { status: 400 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    }

    await prisma.post.delete({ where: { id } })
    await purgePublicCache('posts')
    await logSecurityEvent('admin_delete', request, `post ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: "Errore nell'eliminazione del post" }, { status: 500 })
  }
}
