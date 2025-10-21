import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// หมายเหตุ: ไม่ใช้ edge runtime เพราะ Prisma ต้องการ Node.js runtime
// สำหรับ Cloudflare deployment ให้ใช้ Workers API แทน

export async function GET() {
  try {
    const clients = await db.client.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const client = await db.client.create({
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

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}