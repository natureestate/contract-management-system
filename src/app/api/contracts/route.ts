import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// หมายเหตุ: ไม่ใช้ edge runtime เพราะ Prisma ต้องการ Node.js runtime
// สำหรับ Cloudflare deployment ให้ใช้ Workers API แทน

export async function GET() {
  try {
    const contracts = await db.contract.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const contract = await db.contract.create({
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

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}