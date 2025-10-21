'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Users, Building, User } from 'lucide-react'
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
  taxId?: string
  contactPerson?: string
  createdAt: string
}

interface ClientFormData {
  name: string
  type: string
  idCard: string
  registrationNo: string
  address: string
  phone: string
  email: string
  taxId: string
  contactPerson: string
}

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    type: 'individual',
    idCard: '',
    registrationNo: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    contactPerson: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        type: editingClient.type,
        idCard: editingClient.idCard || '',
        registrationNo: editingClient.registrationNo || '',
        address: editingClient.address,
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        taxId: editingClient.taxId || '',
        contactPerson: editingClient.contactPerson || '',
      })
    } else {
      setFormData({
        name: '',
        type: 'individual',
        idCard: '',
        registrationNo: '',
        address: '',
        phone: '',
        email: '',
        taxId: '',
        contactPerson: '',
      })
    }
  }, [editingClient])

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/api/clients')
      setClients(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching clients:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingClient) {
        await apiClient.put(`/api/clients/${editingClient.id}`, formData)
      } else {
        await apiClient.post('/api/clients', formData)
      }

      setIsDialogOpen(false)
      setEditingClient(null)
      fetchClients()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleDelete = async (clientId: string) => {
    if (confirm('คุณแน่ใจว่าต้องการลบลูกค้านี้?')) {
      try {
        await apiClient.delete(`/api/clients/${clientId}`)
        fetchClients()
      } catch (error) {
        console.error('Error deleting client:', error)
      }
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการลูกค้า</h2>
          <p className="text-gray-600">จัดการข้อมูลลูกค้าทั้งบุคคลธรรมดาและนิติบุคคล</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มลูกค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </DialogTitle>
              <DialogDescription>
                {editingClient ? 'แก้ไขข้อมูลลูกค้า' : 'กรอกข้อมูลลูกค้าใหม่'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ชื่อลูกค้า"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">ประเภท</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">บุคคลธรรมดา</SelectItem>
                      <SelectItem value="company">นิติบุคคล</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'individual' ? (
                <div>
                  <Label htmlFor="idCard">เลขบัตรประชาชน</Label>
                  <Input
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => handleInputChange('idCard', e.target.value)}
                    placeholder="เลขบัตรประชาชน 13 หลัก"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="registrationNo">เลขทะเบียนบริษัท</Label>
                  <Input
                    id="registrationNo"
                    value={formData.registrationNo}
                    onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                    placeholder="เลขทะเบียนนิติบุคคล"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="ที่อยู่ลูกค้า"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="เบอร์โทรศัพท์"
                  />
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="อีเมล"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="เลขประจำตัวผู้เสียภาษี"
                  />
                </div>
                {formData.type === 'company' && (
                  <div>
                    <Label htmlFor="contactPerson">ผู้ติดต่อ</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="ชื่อผู้ติดต่อ"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="ค้นหาลูกค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'ไม่พบลูกค้าที่ค้นหา' : 'ยังไม่มีลูกค้า'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เพิ่มลูกค้าคนแรกของคุณ'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มลูกค้าใหม่
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {client.type === 'company' ? (
                      <Building className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {client.type === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.type === 'company' ? 'เลขทะเบียน' : 'เลขบัตรประชาชน'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {client.type === 'company' ? client.registrationNo : client.idCard || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">ที่อยู่</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{client.address}</p>
                  </div>
                  
                  {client.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">โทรศัพท์</p>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    </div>
                  )}
                  
                  {client.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">อีเมล</p>
                      <p className="text-sm text-gray-600 truncate">{client.email}</p>
                    </div>
                  )}
                  
                  {client.type === 'company' && client.contactPerson && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">ผู้ติดต่อ</p>
                      <p className="text-sm text-gray-600">{client.contactPerson}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(client)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(client.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      ลบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}