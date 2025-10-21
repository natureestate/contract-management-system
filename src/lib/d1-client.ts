// Cloudflare D1 Database Client
// Wrapper class สำหรับจัดการ database operations ผ่าน D1

import type { Contract, Client } from '@/types/cloudflare';

/**
 * D1 Database Client
 * ใช้สำหรับ CRUD operations กับ Cloudflare D1 database
 */
export class D1Client {
  constructor(private db: D1Database) {}

  // ==================== Contract Methods ====================

  /**
   * ดึงรายการสัญญาทั้งหมด พร้อมข้อมูลลูกค้า
   */
  async getContracts(): Promise<Contract[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        c.*,
        json_object(
          'id', cl.id,
          'name', cl.name,
          'type', cl.type
        ) as client
      FROM Contract c
      LEFT JOIN Client cl ON c.clientId = cl.id
      ORDER BY c.createdAt DESC
    `).all();
    
    return results as any[];
  }

  /**
   * ดึงข้อมูลสัญญา 1 รายการ
   */
  async getContract(id: string): Promise<Contract | null> {
    const { results } = await this.db.prepare(`
      SELECT 
        c.*,
        json_object(
          'id', cl.id,
          'name', cl.name,
          'type', cl.type,
          'address', cl.address,
          'phone', cl.phone,
          'email', cl.email
        ) as client
      FROM Contract c
      LEFT JOIN Client cl ON c.clientId = cl.id
      WHERE c.id = ?
    `).bind(id).all();
    
    return results[0] as Contract || null;
  }

  /**
   * สร้างสัญญาใหม่
   */
  async createContract(data: Partial<Contract>): Promise<Contract> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(`
      INSERT INTO Contract (
        id, contractNumber, location, contractDate,
        clientId, contractorName, contractorType,
        contractorIdCard, contractorRegistration, contractorAddress, contractorPosition,
        buildingType, buildingFloors, buildingArea, projectLocation,
        floorPlanDuration, threeDDuration, constructionDuration,
        totalFee, paymentTerms,
        witness1Name, witness2Name,
        status, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?
      )
    `).bind(
      id,
      data.contractNumber,
      data.location,
      data.contractDate,
      data.clientId,
      data.contractorName,
      data.contractorType,
      data.contractorIdCard || null,
      data.contractorRegistration || null,
      data.contractorAddress,
      data.contractorPosition || null,
      data.buildingType,
      data.buildingFloors,
      data.buildingArea,
      data.projectLocation,
      data.floorPlanDuration || 10,
      data.threeDDuration || 15,
      data.constructionDuration || 20,
      data.totalFee,
      data.paymentTerms,
      data.witness1Name || null,
      data.witness2Name || null,
      data.status || 'draft',
      now,
      now
    ).run();
    
    return this.getContract(id) as Promise<Contract>;
  }

  /**
   * อัพเดทข้อมูลสัญญา
   */
  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const now = new Date().toISOString();
    
    // Build dynamic UPDATE query
    const fields = Object.keys(data).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (data as any)[field]);
    
    await this.db.prepare(`
      UPDATE Contract 
      SET ${setClause}, updatedAt = ?
      WHERE id = ?
    `).bind(...values, now, id).run();
    
    return this.getContract(id) as Promise<Contract>;
  }

  /**
   * ลบสัญญา
   */
  async deleteContract(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM Contract WHERE id = ?').bind(id).run();
  }

  // ==================== Client Methods ====================

  /**
   * ดึงรายการลูกค้าทั้งหมด
   */
  async getClients(): Promise<Client[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM Client ORDER BY createdAt DESC
    `).all();
    
    return results as Client[];
  }

  /**
   * ดึงข้อมูลลูกค้า 1 รายการ
   */
  async getClient(id: string): Promise<Client | null> {
    const { results } = await this.db.prepare(`
      SELECT * FROM Client WHERE id = ?
    `).bind(id).all();
    
    return results[0] as Client || null;
  }

  /**
   * สร้างลูกค้าใหม่
   */
  async createClient(data: Partial<Client>): Promise<Client> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(`
      INSERT INTO Client (
        id, name, type, idCard, registrationNo,
        address, phone, email, taxId, contactPerson,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.type,
      data.idCard || null,
      data.registrationNo || null,
      data.address,
      data.phone || null,
      data.email || null,
      data.taxId || null,
      data.contactPerson || null,
      now,
      now
    ).run();
    
    return this.getClient(id) as Promise<Client>;
  }

  /**
   * อัพเดทข้อมูลลูกค้า
   */
  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const now = new Date().toISOString();
    
    const fields = Object.keys(data).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (data as any)[field]);
    
    await this.db.prepare(`
      UPDATE Client 
      SET ${setClause}, updatedAt = ?
      WHERE id = ?
    `).bind(...values, now, id).run();
    
    return this.getClient(id) as Promise<Client>;
  }

  /**
   * ลบลูกค้า
   */
  async deleteClient(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM Client WHERE id = ?').bind(id).run();
  }

  // ==================== Utility Methods ====================

  /**
   * ตรวจสอบการเชื่อมต่อ database
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.db.prepare('SELECT 1').first();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

