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

    // Generate HTML content for PDF
    const htmlContent = generateContractHTML(contract)

    // For now, return the HTML content
    // In a real implementation, you would use a PDF library like puppeteer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="สัญญาว่าจ้าง-${contract.contractNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateContractHTML(contract: any): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('th-TH', { month: 'long' })
    const year = date.getFullYear() + 543
    return `${day} ${month} พ.ศ. ${year}`
  }

  const formatThaiNumber = (num: number) => {
    return num.toLocaleString('th-TH')
  }

  return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>สัญญาว่าจ้างออกแบบและเขียนแบบ</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .contract-info {
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .section h3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .party-info {
            margin-bottom: 15px;
        }
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            margin: 20px 0;
            font-weight: bold;
        }
        .witnesses {
            margin-top: 30px;
        }
        .witnesses-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        ul, ol {
            margin-left: 20px;
        }
        .bold {
            font-weight: bold;
        }
        .italic {
            font-style: italic;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>สัญญาว่าจ้างออกแบบและเขียนแบบ</h1>
        <div class="contract-info">
            <p><strong>สัญญาเลขที่</strong> ${contract.contractNumber}</p>
            <p><strong>ทำที่</strong> ${contract.location}</p>
            <p><strong>วันที่</strong> ${formatDate(contract.contractDate)}</p>
        </div>
    </div>

    <div class="section">
        <h2>คู่สัญญา</h2>
        <div class="party-info">
            <h3>ผู้ว่าจ้าง:</h3>
            <p class="bold">${contract.client.name}</p>
            ${contract.client.type === 'individual' ? 
              `<p>บัตรประชาชนเลขที่ ${contract.client.idCard}</p>` :
              `<p>ทะเบียนเลขที่ ${contract.client.registrationNo}</p>`
            }
            <p>ที่อยู่ ${contract.client.address}</p>
        </div>

        <div class="party-info">
            <h3>ผู้รับจ้าง:</h3>
            <p class="bold">${contract.contractorName}</p>
            ${contract.contractorType === 'individual' ? 
              `<p>บัตรประชาชนเลขที่ ${contract.contractorIdCard}</p>` :
              `<p>ทะเบียนเลขที่ ${contract.contractorRegistration}</p>
               <p>สำนักงานตั้งอยู่เลขที่ ${contract.contractorAddress}</p>`
            }
        </div>
    </div>

    <div class="section">
        <h2>ข้อความในสัญญา</h2>
        
        <h3>ข้อ 1 วัตถุประสงค์</h3>
        <p>ผู้ว่าจ้างตกลงว่าจ้าง และผู้รับจ้างตกลงรับจ้างออกแบบและเขียนแบบก่อสร้างบ้านพักอาศัย ด้วยระบบ Fully Precast Concrete System ตามรายละเอียดดังนี้</p>
        <ul>
            <li>ประเภทอาคาร: ${contract.buildingType} ${contract.buildingFloors} ชั้น</li>
            <li>พื้นที่ใช้สอยโดยประมาณ: ${contract.buildingArea} ตารางเมตร</li>
            <li>ที่ตั้งโครงการ: ${contract.projectLocation}</li>
        </ul>

        <h3>ข้อ 2 ขอบเขตงาน</h3>
        <p>ผู้รับจ้างตกลงดำเนินการดังนี้</p>
        <ol>
            <li>สำรวจพื้นที่และรับฟังความต้องการของผู้ว่าจ้าง</li>
            <li>ออกแบบสถาปัตยกรรม (Architectural Design)</li>
            <li>ออกแบบโครงสร้าง (Structural Design) โดยวิศวกรโครงสร้างผู้ได้รับใบอนุญาต</li>
            <li>ออกแบบระบบไฟฟ้า-ประปา-สุขาภิบาล (MEP System)</li>
            <li>จัดทำแบบก่อสร้างครบชุดสำหรับยื่นขออนุญาตและก่อสร้าง</li>
            <li>คำนวณปริมาณงานและประมาณราคาเบื้องต้น</li>
        </ol>

        <h3>ข้อ 3 ระยะเวลาดำเนินการ</h3>
        <p>ผู้รับจ้างตกลงดำเนินการและส่งมอบงานตามขั้นตอนและระยะเวลาดังนี้</p>
        <ol>
            <li>นัดดูแปลน (Floor Plan) ภายใน <span class="bold">${contract.floorPlanDuration} วัน</span> นับจากวันลงนามในสัญญา</li>
            <li>ส่งมอบภาพ 3 มิติ (3D Perspective) ภายใน <span class="bold">${contract.threeDDuration} วัน</span> นับจากวันที่ผู้ว่าจ้างยืนยัน (Confirm) แบบแปลน</li>
            <li>ส่งมอบแบบก่อสร้างครบชุด (Construction Drawing) ภายใน <span class="bold">${contract.constructionDuration} วัน</span> นับจากวันที่ผู้ว่าจ้างยืนยัน (Confirm) ภาพ 3 มิติ</li>
        </ol>
        <p class="italic">หมายเหตุ: ระยะเวลาข้างต้นนับเฉพาะวันทำการ และเริ่มนับหลังจากที่ผู้ว่าจ้างให้ความเห็นชอบในแต่ละขั้นตอน หากผู้ว่าจ้างขอแก้ไขเปลี่ยนแปลง ระยะเวลาจะเริ่มนับใหม่หลังจากที่ผู้ว่าจ้างยืนยันแบบแก้ไข</p>

        <h3>ข้อ 4 ค่าตอบแทนและการชำระเงิน</h3>
        <p>ค่าตอบแทนรวมทั้งสิ้น <span class="bold">${formatThaiNumber(contract.totalFee)} บาท</span></p>
        <p>${contract.paymentTerms}</p>
        <p class="italic">(หมายเหตุ: กรณีมีการแก้ไขเปลี่ยนแปลงแบบเกิน 3 ครั้ง ผู้ว่าจ้างตกลงชำระค่าบริการเพิ่มเติมตามอัตราที่ผู้รับจ้างกำหนด)</p>

        <h3>ข้อ 5 หน้าที่และความรับผิดชอบ</h3>
        <div>
            <p class="bold">5.1 ผู้รับจ้างมีหน้าที่:</p>
            <ul>
                <li>ออกแบบด้วยความรู้ความชำนาญตามมาตรฐานวิชาชีพ</li>
                <li>รับผิดชอบความถูกต้องของแบบที่ส่งมอบ</li>
                <li>แก้ไขแบบได้ไม่เกิน 3 ครั้ง (ภายในขอบเขตเดิม)</li>
            </ul>
        </div>
        <div>
            <p class="bold">5.2 ผู้ว่าจ้างมีหน้าที่:</p>
            <ul>
                <li>ให้ข้อมูลและความร่วมมือแก่ผู้รับจ้างอย่างเพียงพอ</li>
                <li>ตัดสินใจและอนุมัติแบบภายในระยะเวลาที่กำหนด</li>
                <li>ชำระค่าตอบแทนตามกำหนด</li>
            </ul>
        </div>

        <h3>ข้อ 6 ลิขสิทธิ์และการใช้แบบ</h3>
        <p>ลิขสิทธิ์ในงานออกแบบเป็นของผู้รับจ้าง แต่ผู้ว่าจ้างมีสิทธิ์ใช้แบบเพื่อก่อสร้างเฉพาะโครงการนี้เท่านั้น ห้ามนำไปใช้ซ้ำหรือดัดแปลงโดยไม่ได้รับอนุญาต</p>

        <h3>ข้อ 7 อื่นๆ</h3>
        <p>สัญญานี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ</p>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <p class="signature-line">ลงชื่อ .......................................... ผู้ว่าจ้าง</p>
            <p>(${contract.client.name})</p>
            <p>วันที่ ......../......../.........</p>
        </div>
        <div class="signature-box">
            <p class="signature-line">ลงชื่อ .......................................... ผู้รับจ้าง</p>
            <p>(${contract.contractorName})</p>
            ${contract.contractorType === 'company' ? `<p>ตำแหน่ง ${contract.contractorPosition}</p>` : ''}
            <p>วันที่ ......../......../.........</p>
        </div>
    </div>

    ${contract.witness1Name || contract.witness2Name ? `
    <div class="witnesses">
        <h3 class="bold text-center">พยาน</h3>
        <div class="witnesses-grid">
            ${contract.witness1Name ? `
            <div class="signature-box">
                <p class="signature-line">ลงชื่อ .......................................... พยาน 1</p>
                <p>(${contract.witness1Name})</p>
            </div>
            ` : ''}
            ${contract.witness2Name ? `
            <div class="signature-box">
                <p class="signature-line">ลงชื่อ .......................................... พยาน 2</p>
                <p>(${contract.witness2Name})</p>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}
</body>
</html>
  `
}