'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Client {
  id: string
  name: string
  type: string
  idCard?: string
  registrationNo?: string
  address: string
  phone?: string
  email?: string
}

interface ContractFormData {
  // ข้อมูลทั่วไป
  contractNumber: string
  location: string
  contractDate: string
  
  // ข้อมูลผู้ว่าจ้าง
  clientId: string
  clientName: string
  clientType: string
  clientIdCard: string
  clientAddress: string
  
  // ข้อมูลผู้รับจ้าง
  contractorName: string
  contractorType: string
  contractorIdCard: string
  contractorRegistration: string
  contractorAddress: string
  contractorPosition: string
  
  // รายละเอียดโครงการ
  buildingType: string
  buildingFloors: string
  buildingArea: string
  projectLocation: string
  
  // ระยะเวลาดำเนินการ
  floorPlanDuration: string
  threeDDuration: string
  constructionDuration: string
  
  // ค่าตอบแทน
  totalFee: string
  paymentTerms: string
  
  // พยาน
  witness1Name: string
  witness2Name: string
}

interface ContractFormProps {
  contract?: any
  onSave: () => void
}

export function ContractForm({ contract, onSave }: ContractFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const [formData, setFormData] = useState<ContractFormData>({
    contractNumber: '',
    location: '',
    contractDate: new Date().toISOString().split('T')[0],
    
    clientId: '',
    clientName: '',
    clientType: 'individual',
    clientIdCard: '',
    clientAddress: '',
    
    contractorName: 'บริษัท เนเจอร์ เอ็ซเทท จำกัด',
    contractorType: 'company',
    contractorIdCard: '',
    contractorRegistration: '',
    contractorAddress: '373/31 ถ.สกลนคร-กาฬสินธุ์ อ.เมืองสกลนคร จ.สกลนคร 47000',
    contractorPosition: 'กรรมการผู้มีอำนาจ',
    
    buildingType: 'บ้านพักอาศัย',
    buildingFloors: '',
    buildingArea: '',
    projectLocation: '',
    
    floorPlanDuration: '10',
    threeDDuration: '15',
    constructionDuration: '20',
    
    totalFee: '32500',
    paymentTerms: 'ชำระเต็มจำนวน 100% เมื่อลงนามในสัญญา',
    
    witness1Name: '',
    witness2Name: '',
  })

  useEffect(() => {
    fetchClients()
    if (contract) {
      // Load contract data for editing
      setFormData({
        ...formData,
        contractNumber: contract.contractNumber || '',
        location: contract.location || '',
        contractDate: contract.contractDate ? new Date(contract.contractDate).toISOString().split('T')[0] : '',
        clientId: contract.clientId || '',
        contractorName: contract.contractorName || '',
        contractorType: contract.contractorType || 'company',
        contractorIdCard: contract.contractorIdCard || '',
        contractorRegistration: contract.contractorRegistration || '',
        contractorAddress: contract.contractorAddress || '',
        contractorPosition: contract.contractorPosition || '',
        buildingType: contract.buildingType || '',
        buildingFloors: contract.buildingFloors || '',
        buildingArea: contract.buildingArea || '',
        projectLocation: contract.projectLocation || '',
        floorPlanDuration: contract.floorPlanDuration?.toString() || '10',
        threeDDuration: contract.threeDDuration?.toString() || '15',
        constructionDuration: contract.constructionDuration?.toString() || '20',
        totalFee: contract.totalFee?.toString() || '32500',
        paymentTerms: contract.paymentTerms || '',
        witness1Name: contract.witness1Name || '',
        witness2Name: contract.witness2Name || '',
      })
    }
  }, [contract])

  useEffect(() => {
    generateContractNumber()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/api/clients')
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const generateContractNumber = () => {
    const now = new Date()
    const year = now.getFullYear() + 543 // Buddhist calendar
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const contractNumber = `${random}/${year}`
    setFormData(prev => ({ ...prev, contractNumber }))
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setSelectedClient(client)
      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        clientIdCard: client.idCard || '',
        clientAddress: client.address,
      }))
    }
  }

  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        totalFee: parseFloat(formData.totalFee),
        floorPlanDuration: parseInt(formData.floorPlanDuration),
        threeDDuration: parseInt(formData.threeDDuration),
        constructionDuration: parseInt(formData.constructionDuration),
        contractDate: new Date(formData.contractDate).toISOString(),
      }

      if (contract?.id) {
        await apiClient.put(`/api/contracts/${contract.id}`, payload)
      } else {
        await apiClient.post('/api/contracts', payload)
      }

      onSave()
    } catch (error) {
      console.error('Error saving contract:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ข้อมูลทั่วไป */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลทั่วไป</CardTitle>
          <CardDescription>ข้อมูลพื้นฐานของสัญญา</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contractNumber">สัญญาเลขที่</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                placeholder="สัญญาเลขที่"
              />
            </div>
            <div>
              <Label htmlFor="location">ทำที่</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="สถานที่ทำสัญญา"
              />
            </div>
            <div>
              <Label htmlFor="contractDate">วันที่ทำสัญญา</Label>
              <Input
                id="contractDate"
                type="date"
                value={formData.contractDate}
                onChange={(e) => handleInputChange('contractDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลผู้ว่าจ้าง */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลผู้ว่าจ้าง</CardTitle>
          <CardDescription>เลือกลูกค้าหรือกรอกข้อมูลใหม่</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientSelect">เลือกลูกค้า</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.type === 'individual' ? 'บุคคล' : 'บริษัท'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">ชื่อผู้ว่าจ้าง</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="ชื่อผู้ว่าจ้าง"
              />
            </div>
            <div>
              <Label htmlFor="clientIdCard">เลขบัตรประชาชน/เลขทะเบียน</Label>
              <Input
                id="clientIdCard"
                value={formData.clientIdCard}
                onChange={(e) => handleInputChange('clientIdCard', e.target.value)}
                placeholder="เลขบัตรประชาชนหรือเลขทะเบียน"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="clientAddress">ที่อยู่</Label>
            <Textarea
              id="clientAddress"
              value={formData.clientAddress}
              onChange={(e) => handleInputChange('clientAddress', e.target.value)}
              placeholder="ที่อยู่ผู้ว่าจ้าง"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลผู้รับจ้าง */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลผู้รับจ้าง</CardTitle>
          <CardDescription>ข้อมูลผู้รับจ้าง (บริษัทหรือบุคคล)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractorName">ชื่อผู้รับจ้าง</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) => handleInputChange('contractorName', e.target.value)}
                placeholder="ชื่อผู้รับจ้าง"
              />
            </div>
            <div>
              <Label htmlFor="contractorType">ประเภทผู้รับจ้าง</Label>
              <Select value={formData.contractorType} onValueChange={(value) => handleInputChange('contractorType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">บุคคล</SelectItem>
                  <SelectItem value="company">บริษัท</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractorIdCard">เลขบัตรประชาชน</Label>
              <Input
                id="contractorIdCard"
                value={formData.contractorIdCard}
                onChange={(e) => handleInputChange('contractorIdCard', e.target.value)}
                placeholder="เลขบัตรประชาชน (กรณีบุคคล)"
              />
            </div>
            <div>
              <Label htmlFor="contractorRegistration">เลขทะเบียนบริษัท</Label>
              <Input
                id="contractorRegistration"
                value={formData.contractorRegistration}
                onChange={(e) => handleInputChange('contractorRegistration', e.target.value)}
                placeholder="เลขทะเบียนบริษัท (กรณีบริษัท)"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="contractorAddress">ที่อยู่ผู้รับจ้าง</Label>
            <Textarea
              id="contractorAddress"
              value={formData.contractorAddress}
              onChange={(e) => handleInputChange('contractorAddress', e.target.value)}
              placeholder="ที่อยู่ผู้รับจ้าง"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="contractorPosition">ตำแหน่ง (กรณีบริษัท)</Label>
            <Input
              id="contractorPosition"
              value={formData.contractorPosition}
              onChange={(e) => handleInputChange('contractorPosition', e.target.value)}
              placeholder="ตำแหน่งผู้มีอำนาจลงนาม"
            />
          </div>
        </CardContent>
      </Card>

      {/* รายละเอียดโครงการ */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดโครงการ</CardTitle>
          <CardDescription>ข้อมูลโครงการก่อสร้าง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buildingType">ประเภทอาคาร</Label>
              <Input
                id="buildingType"
                value={formData.buildingType}
                onChange={(e) => handleInputChange('buildingType', e.target.value)}
                placeholder="เช่น บ้านพักอาศัย"
              />
            </div>
            <div>
              <Label htmlFor="buildingFloors">จำนวนชั้น</Label>
              <Input
                id="buildingFloors"
                value={formData.buildingFloors}
                onChange={(e) => handleInputChange('buildingFloors', e.target.value)}
                placeholder="จำนวนชั้น"
              />
            </div>
            <div>
              <Label htmlFor="buildingArea">พื้นที่ใช้สอย (ตร.ม.)</Label>
              <Input
                id="buildingArea"
                value={formData.buildingArea}
                onChange={(e) => handleInputChange('buildingArea', e.target.value)}
                placeholder="พื้นที่ใช้สอย"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="projectLocation">ที่ตั้งโครงการ</Label>
            <Textarea
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => handleInputChange('projectLocation', e.target.value)}
              placeholder="ที่อยู่ที่ตั้งโครงการ"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ระยะเวลาดำเนินการ */}
      <Card>
        <CardHeader>
          <CardTitle>ระยะเวลาดำเนินการ</CardTitle>
          <CardDescription>กำหนดระยะเวลาส่งมอบงาน (วันทำการ)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="floorPlanDuration">นัดดูแปลน (วัน)</Label>
              <Input
                id="floorPlanDuration"
                type="number"
                value={formData.floorPlanDuration}
                onChange={(e) => handleInputChange('floorPlanDuration', e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="threeDDuration">ภาพ 3 มิติ (วัน)</Label>
              <Input
                id="threeDDuration"
                type="number"
                value={formData.threeDDuration}
                onChange={(e) => handleInputChange('threeDDuration', e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="constructionDuration">แบบก่อสร้าง (วัน)</Label>
              <Input
                id="constructionDuration"
                type="number"
                value={formData.constructionDuration}
                onChange={(e) => handleInputChange('constructionDuration', e.target.value)}
                placeholder="20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ค่าตอบแทน */}
      <Card>
        <CardHeader>
          <CardTitle>ค่าตอบแทน</CardTitle>
          <CardDescription>ข้อมูลค่าตอบแทนและเงื่อนไขการชำระเงิน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalFee">ค่าตอบแทนรวม (บาท)</Label>
              <Input
                id="totalFee"
                type="number"
                value={formData.totalFee}
                onChange={(e) => handleInputChange('totalFee', e.target.value)}
                placeholder="32500"
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
              <Input
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                placeholder="ชำระเต็มจำนวน 100% เมื่อลงนามในสัญญา"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* พยาน */}
      <Card>
        <CardHeader>
          <CardTitle>พยาน</CardTitle>
          <CardDescription>ข้อมูลพยานในสัญญา (ไม่ระบุก็ได้)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="witness1Name">ชื่อพยาน 1</Label>
              <Input
                id="witness1Name"
                value={formData.witness1Name}
                onChange={(e) => handleInputChange('witness1Name', e.target.value)}
                placeholder="ชื่อพยานคนที่ 1"
              />
            </div>
            <div>
              <Label htmlFor="witness2Name">ชื่อพยาน 2</Label>
              <Input
                id="witness2Name"
                value={formData.witness2Name}
                onChange={(e) => handleInputChange('witness2Name', e.target.value)}
                placeholder="ชื่อพยานคนที่ 2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSave}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'กำลังบันทึก...' : 'บันทึกสัญญา'}
        </Button>
      </div>
    </form>
  )
}