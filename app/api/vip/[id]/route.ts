import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE - Elimina un VIP
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID VIP non valido' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    await prisma.vip.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting VIP:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del VIP' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna un VIP
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID VIP non valido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { imageUrl, title } = body

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database non disponibile' },
        { status: 500 }
      )
    }

    const vip = await prisma.vip.update({
      where: { id },
      data: {
        imageUrl: imageUrl || undefined,
        title: title !== undefined ? title : undefined
      }
    })

    return NextResponse.json(vip)
  } catch (error) {
    console.error('Error updating VIP:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del VIP' },
      { status: 500 }
    )
  }
}

