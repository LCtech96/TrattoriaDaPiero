import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Recupera tutti i VIP
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const vips = await prisma.vip.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(vips)
  } catch (error) {
    console.error('Error fetching VIPs:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei VIP' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo VIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, title } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL immagine non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const vip = await prisma.vip.create({
      data: {
        imageUrl,
        title: title || null
      }
    })

    return NextResponse.json(vip)
  } catch (error) {
    console.error('Error creating VIP:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del VIP' },
      { status: 500 }
    )
  }
}

