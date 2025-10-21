'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Contract {
  id: string
  contractNumber: string
  location: string
  contractDate: string
  client: {
    name: string
    type: string
    idCard?: string
    registrationNo?: string
    address: string
  }
  contractorName: string
  contractorType: string
  contractorIdCard?: string
  contractorRegistration?: string
  contractorAddress: string
  contractorPosition?: string
  buildingType: string
  buildingFloors: string
  buildingArea: string
  projectLocation: string
  floorPlanDuration: number
  threeDDuration: number
  constructionDuration: number
  totalFee: number
  paymentTerms: string
  witness1Name?: string
  witness2Name?: string
}

interface ContractPreviewProps {
  contract: Contract
  isOpen: boolean
  onClose: () => void
}

export function ContractPreview({ contract, isOpen, onClose }: ContractPreviewProps) {
  const [downloading, setDownloading] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('th-TH', { month: 'long' })
    const year = date.getFullYear() + 543 // Buddhist calendar
    return `${day} ${month} พ.ศ. ${year}`
  }

  const formatThaiNumber = (num: number) => {
    return num.toLocaleString('th-TH')
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await apiClient.get(`/api/contracts/${contract.id}/pdf`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `สัญญาว่าจ้าง-${contract.contractNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>พรีวิวสัญญาว่าจ้าง</DialogTitle>
              <DialogDescription>
                สัญญาเลขที่ {contract.contractNumber}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {downloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด PDF'}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-white p-8 space-y-6" style={{ minHeight: '842px' }}>
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">สัญญาว่าจ้างออกแบบและเขียนแบบ</h1>
            <div className="space-y-1">
              <p><strong>สัญญาเลขที่</strong> {contract.contractNumber}</p>
              <p><strong>ทำที่</strong> {contract.location}</p>
              <p><strong>วันที่</strong> {formatDate(contract.contractDate)}</p>
            </div>
          </div>

          {/* Contract Parties */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">คู่สัญญา</h2>
            
            <div>
              <h3 className="font-bold mb-2">ผู้ว่าจ้าง:</h3>
              <p className="font-semibold">{contract.client.name}</p>
              {contract.client.type === 'individual' ? (
                <p>บัตรประชาชนเลขที่ {contract.client.idCard}</p>
              ) : (
                <p>ทะเบียนเลขที่ {contract.client.registrationNo}</p>
              )}
              <p>ที่อยู่ {contract.client.address}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">ผู้รับจ้าง:</h3>
              <p className="font-semibold">{contract.contractorName}</p>
              {contract.contractorType === 'individual' ? (
                <p>บัตรประชาชนเลขที่ {contract.contractorIdCard}</p>
              ) : (
                <>
                  <p>ทะเบียนเลขที่ {contract.contractorRegistration}</p>
                  <p>สำนักงานตั้งอยู่เลขที่ {contract.contractorAddress}</p>
                </>
              )}
            </div>
          </div>

          {/* Contract Terms */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">ข้อความในสัญญา</h2>

            {/* ข้อ 1 วัตถุประสงค์ */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 1 วัตถุประสงค์</h3>
              <p>ผู้ว่าจ้างตกลงว่าจ้าง และผู้รับจ้างตกลงรับจ้างออกแบบและเขียนแบบก่อสร้างบ้านพักอาศัย ด้วยระบบ Fully Precast Concrete System ตามรายละเอียดดังนี้</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>ประเภทอาคาร: {contract.buildingType} {contract.buildingFloors} ชั้น</li>
                <li>พื้นที่ใช้สอยโดยประมาณ: {contract.buildingArea} ตารางเมตร</li>
                <li>ที่ตั้งโครงการ: {contract.projectLocation}</li>
              </ul>
            </div>

            {/* ข้อ 2 ขอบเขตงาน */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 2 ขอบเขตงาน</h3>
              <p>ผู้รับจ้างตกลงดำเนินการดังนี้</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>สำรวจพื้นที่และรับฟังความต้องการของผู้ว่าจ้าง</li>
                <li>ออกแบบสถาปัตยกรรม (Architectural Design)</li>
                <li>ออกแบบโครงสร้าง (Structural Design) โดยวิศวกรโครงสร้างผู้ได้รับใบอนุญาต</li>
                <li>ออกแบบระบบไฟฟ้า-ประปา-สุขาภิบาล (MEP System)</li>
                <li>จัดทำแบบก่อสร้างครบชุดสำหรับยื่นขออนุญาตและก่อสร้าง</li>
                <li>คำนวณปริมาณงานและประมาณราคาเบื้องต้น</li>
              </ol>
            </div>

            {/* ข้อ 3 ระยะเวลาดำเนินการ */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 3 ระยะเวลาดำเนินการ</h3>
              <p>ผู้รับจ้างตกลงดำเนินการและส่งมอบงานตามขั้นตอนและระยะเวลาดังนี้</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>นัดดูแปลน (Floor Plan) ภายใน <strong>{contract.floorPlanDuration} วัน</strong> นับจากวันลงนามในสัญญา</li>
                <li>ส่งมอบภาพ 3 มิติ (3D Perspective) ภายใน <strong>{contract.threeDDuration} วัน</strong> นับจากวันที่ผู้ว่าจ้างยืนยัน (Confirm) แบบแปลน</li>
                <li>ส่งมอบแบบก่อสร้างครบชุด (Construction Drawing) ภายใน <strong>{contract.constructionDuration} วัน</strong> นับจากวันที่ผู้ว่าจ้างยืนยัน (Confirm) ภาพ 3 มิติ</li>
              </ol>
              <p className="mt-2 text-sm italic">
                หมายเหตุ: ระยะเวลาข้างต้นนับเฉพาะวันทำการ และเริ่มนับหลังจากที่ผู้ว่าจ้างให้ความเห็นชอบในแต่ละขั้นตอน หากผู้ว่าจ้างขอแก้ไขเปลี่ยนแปลง ระยะเวลาจะเริ่มนับใหม่หลังจากที่ผู้ว่าจ้างยืนยันแบบแก้ไข
              </p>
            </div>

            {/* ข้อ 4 ค่าตอบแทนและการชำระเงิน */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 4 ค่าตอบแทนและการชำระเงิน</h3>
              <p>ค่าตอบแทนรวมทั้งสิ้น <strong>{formatThaiNumber(contract.totalFee)} บาท</strong></p>
              <p className="mt-2">{contract.paymentTerms}</p>
              <p className="mt-2 text-sm italic">
                (หมายเหตุ: กรณีมีการแก้ไขเปลี่ยนแปลงแบบเกิน 3 ครั้ง ผู้ว่าจ้างตกลงชำระค่าบริการเพิ่มเติมตามอัตราที่ผู้รับจ้างกำหนด)
              </p>
            </div>

            {/* ข้อ 5 หน้าที่และความรับผิดชอบ */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 5 หน้าที่และความรับผิดชอบ</h3>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold">5.1 ผู้รับจ้างมีหน้าที่:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>ออกแบบด้วยความรู้ความชำนาญตามมาตรฐานวิชาชีพ</li>
                    <li>รับผิดชอบความถูกต้องของแบบที่ส่งมอบ</li>
                    <li>แก้ไขแบบได้ไม่เกิน 3 ครั้ง (ภายในขอบเขตเดิม)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">5.2 ผู้ว่าจ้างมีหน้าที่:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>ให้ข้อมูลและความร่วมมือแก่ผู้รับจ้างอย่างเพียงพอ</li>
                    <li>ตัดสินใจและอนุมัติแบบภายในระยะเวลาที่กำหนด</li>
                    <li>ชำระค่าตอบแทนตามกำหนด</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ข้อ 6 ลิขสิทธิ์และการใช้แบบ */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 6 ลิขสิทธิ์และการใช้แบบ</h3>
              <p>ลิขสิทธิ์ในงานออกแบบเป็นของผู้รับจ้าง แต่ผู้ว่าจ้างมีสิทธิ์ใช้แบบเพื่อก่อสร้างเฉพาะโครงการนี้เท่านั้น ห้ามนำไปใช้ซ้ำหรือดัดแปลงโดยไม่ได้รับอนุญาต</p>
            </div>

            {/* ข้อ 7 อื่นๆ */}
            <div>
              <h3 className="font-bold mb-2">ข้อ 7 อื่นๆ</h3>
              <p>สัญญานี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <p className="font-bold mb-8">ลงชื่อ .......................................... ผู้ว่าจ้าง</p>
              <p className="mb-2">({contract.client.name})</p>
              <p>วันที่ ......../......../.........</p>
            </div>
            <div className="text-center">
              <p className="font-bold mb-8">ลงชื่อ .......................................... ผู้รับจ้าง</p>
              <p className="mb-2">({contract.contractorName})</p>
              {contract.contractorType === 'company' && (
                <p className="mb-2">ตำแหน่ง {contract.contractorPosition}</p>
              )}
              <p>วันที่ ......../......../.........</p>
            </div>
          </div>

          {/* Witnesses */}
          {(contract.witness1Name || contract.witness2Name) && (
            <div className="mt-8">
              <h3 className="font-bold text-center mb-4">พยาน</h3>
              <div className="grid grid-cols-2 gap-8">
                {contract.witness1Name && (
                  <div className="text-center">
                    <p className="font-bold mb-4">ลงชื่อ .......................................... พยาน 1</p>
                    <p>({contract.witness1Name})</p>
                  </div>
                )}
                {contract.witness2Name && (
                  <div className="text-center">
                    <p className="font-bold mb-4">ลงชื่อ .......................................... พยาน 2</p>
                    <p>({contract.witness2Name})</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}