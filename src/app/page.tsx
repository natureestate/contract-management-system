'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, FileText, Users, Download, Edit, Eye } from 'lucide-react'
import { ContractForm } from '@/components/contract-form'
import { ClientManagement } from '@/components/client-management'
import { ContractPreview } from '@/components/contract-preview'
import { apiClient } from '@/lib/api-client'

interface Contract {
  id: string
  contractNumber: string
  location: string
  contractDate: string
  client: {
    name: string
    type: string
  }
  contractorName: string
  buildingType: string
  buildingArea: string
  totalFee: number
  status: string
}

export default function Home() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState<'contracts' | 'clients' | 'form'>('contracts')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    const filtered = contracts.filter(contract =>
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.buildingType.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredContracts(filtered)
  }, [searchTerm, contracts])

  const fetchContracts = async () => {
    try {
      const response = await apiClient.get('/api/contracts')
      setContracts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contracts:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'signed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'ฉบับร่าง'
      case 'signed': return 'ลงนามแล้ว'
      case 'completed': return 'เสร็จสิ้น'
      case 'cancelled': return 'ยกเลิก'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleContractSaved = () => {
    fetchContracts()
    setActiveView('contracts')
  }

  const handlePreviewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setShowPreview(true)
  }

  const handleDownloadPDF = async (contractId: string) => {
    try {
      const response = await apiClient.get(`/api/contracts/${contractId}/pdf`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `สัญญาว่าจ้าง-${response.data.contractNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (activeView === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">สร้างสัญญาว่าจ้างใหม่</h1>
            <Button variant="outline" onClick={() => setActiveView('contracts')}>
              กลับ
            </Button>
          </div>
          <ContractForm onSave={handleContractSaved} />
        </div>
      </div>
    )
  }

  if (activeView === 'clients') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">จัดการลูกค้า</h1>
            <Button variant="outline" onClick={() => setActiveView('contracts')}>
              กลับ
            </Button>
          </div>
          <ClientManagement />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการสัญญาว่าจ้าง</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('clients')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                จัดการลูกค้า
              </Button>
              <Button
                onClick={() => setActiveView('form')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                สร้างสัญญาใหม่
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาสัญญา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contracts Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'ไม่พบสัญญาที่ค้นหา' : 'ยังไม่มีสัญญา'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'สร้างสัญญาฉบับแรกของคุณ'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setActiveView('form')}>
                <Plus className="h-4 w-4 mr-2" />
                สร้างสัญญาใหม่
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">เลขที่สัญญา</TableHead>
                      <TableHead className="w-[100px]">วันที่</TableHead>
                      <TableHead>ผู้ว่าจ้าง</TableHead>
                      <TableHead>ผู้รับจ้าง</TableHead>
                      <TableHead>โครงการ</TableHead>
                      <TableHead className="w-[120px]">พื้นที่</TableHead>
                      <TableHead className="w-[120px] text-right">ค่าตอบแทน</TableHead>
                      <TableHead className="w-[100px] text-center">สถานะ</TableHead>
                      <TableHead className="w-[180px] text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {contract.contractNumber}
                        </TableCell>
                        <TableCell>
                          {formatDate(contract.contractDate)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.client.name}</p>
                            <p className="text-sm text-gray-500">
                              {contract.client.type === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.contractorName}</p>
                            <p className="text-sm text-gray-500">
                              {contract.contractorType === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.buildingType}</p>
                            <p className="text-sm text-gray-500">{contract.buildingFloors} ชั้น</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {contract.buildingArea} ตร.ม.
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ฿{contract.totalFee.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusText(contract.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewContract(contract)}
                              className="h-8 w-8 p-0"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(contract.id)}
                              className="h-8 w-8 p-0"
                              title="ดาวน์โหลด PDF"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedContract(contract)
                                setActiveView('form')
                              }}
                              className="h-8 w-8 p-0"
                              title="แก้ไข"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Contract Preview Modal */}
      {showPreview && selectedContract && (
        <ContractPreview
          contract={selectedContract}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}