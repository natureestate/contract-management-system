import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// หมายเหตุ: ไม่ใช้ edge runtime เพราะ Prisma ต้องการ Node.js runtime
// สำหรับ Cloudflare deployment ให้ใช้ Workers API แทน

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: {
        client: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
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
    
    const contract = await db.contract.update({
      where: { id: params.id },
      data: {
        contractNumber: data.contractNumber,
        location: data.location,
        contractDate: new Date(data.contractDate),
        clientId: data.clientId,
        contractorName: data.contractorName,
        contractorType: data.contractorType,
        contractorIdCard: data.contractorIdCard || null,
        contractorRegistration: data.contractorRegistration || null,
        contractorAddress: data.contractorAddress,
        contractorPosition: data.contractorPosition || null,
        buildingType: data.buildingType,
        buildingFloors: data.buildingFloors,
        buildingArea: data.buildingArea,
        projectLocation: data.projectLocation,
        floorPlanDuration: data.floorPlanDuration,
        threeDDuration: data.threeDDuration,
        constructionDuration: data.constructionDuration,
        totalFee: data.totalFee,
        paymentTerms: data.paymentTerms,
        witness1Name: data.witness1Name || null,
        witness2Name: data.witness2Name || null,
        status: data.status,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.contract.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Contract deleted successfully' })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    )
  }
}