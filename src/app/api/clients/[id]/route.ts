import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// หมายเหตุ: ไม่ใช้ edge runtime เพราะ Prisma ต้องการ Node.js runtime
// สำหรับ Cloudflare deployment ให้ใช้ Workers API แทน

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await db.client.findUnique({
      where: { id: params.id }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const client = await db.client.update({
      where: { id: params.id },
      data: {
        name: data.name,
        type: data.type,
        idCard: data.idCard || null,
        registrationNo: data.registrationNo || null,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        taxId: data.taxId || null,
        contactPerson: data.contactPerson || null,
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}