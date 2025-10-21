// Cloudflare R2 Storage Helper
// สำหรับจัดการไฟล์ PDF และเอกสารต่างๆ

/**
 * R2 Storage Client
 * ใช้สำหรับ upload, download, และลบไฟล์จาก Cloudflare R2
 */
export class R2Storage {
  constructor(private bucket: R2Bucket) {}

  // ==================== PDF Operations ====================

  /**
   * อัพโหลด PDF ของสัญญา
   * @param contractId - ID ของสัญญา
   * @param pdfBuffer - PDF file เป็น ArrayBuffer
   * @returns key ของไฟล์ที่เก็บใน R2
   */
  async uploadPDF(contractId: string, pdfBuffer: ArrayBuffer): Promise<string> {
    const key = `contracts/${contractId}.pdf`;
    
    await this.bucket.put(key, pdfBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
        contentDisposition: `attachment; filename="contract-${contractId}.pdf"`,
      },
      customMetadata: {
        contractId: contractId,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    return key;
  }

  /**
   * ดาวน์โหลด PDF ของสัญญา
   * @param contractId - ID ของสัญญา
   * @returns PDF file เป็น ArrayBuffer หรือ null ถ้าไม่พบ
   */
  async getPDF(contractId: string): Promise<ArrayBuffer | null> {
    const key = `contracts/${contractId}.pdf`;
    const object = await this.bucket.get(key);
    
    if (!object) {
      return null;
    }
    
    return await object.arrayBuffer();
  }

  /**
   * ตรวจสอบว่ามี PDF ของสัญญาหรือไม่
   * @param contractId - ID ของสัญญา
   * @returns true ถ้ามีไฟล์, false ถ้าไม่มี
   */
  async hasPDF(contractId: string): Promise<boolean> {
    const key = `contracts/${contractId}.pdf`;
    const object = await this.bucket.head(key);
    return object !== null;
  }

  /**
   * ลบ PDF ของสัญญา
   * @param contractId - ID ของสัญญา
   */
  async deletePDF(contractId: string): Promise<void> {
    const key = `contracts/${contractId}.pdf`;
    await this.bucket.delete(key);
  }

  /**
   * ดึงข้อมูล metadata ของ PDF
   * @param contractId - ID ของสัญญา
   */
  async getPDFMetadata(contractId: string): Promise<R2Object | null> {
    const key = `contracts/${contractId}.pdf`;
    return await this.bucket.head(key);
  }

  // ==================== Signature Image Operations ====================

  /**
   * อัพโหลดรูปลายเซ็น
   * @param contractId - ID ของสัญญา
   * @param signatureType - ประเภทลายเซ็น (client, contractor, witness1, witness2)
   * @param imageBuffer - รูปภาพเป็น ArrayBuffer
   * @returns key ของไฟล์ที่เก็บใน R2
   */
  async uploadSignature(
    contractId: string,
    signatureType: 'client' | 'contractor' | 'witness1' | 'witness2',
    imageBuffer: ArrayBuffer
  ): Promise<string> {
    const key = `signatures/${contractId}/${signatureType}.png`;
    
    await this.bucket.put(key, imageBuffer, {
      httpMetadata: {
        contentType: 'image/png',
      },
      customMetadata: {
        contractId: contractId,
        signatureType: signatureType,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    return key;
  }

  /**
   * ดาวน์โหลดรูปลายเซ็น
   * @param contractId - ID ของสัญญา
   * @param signatureType - ประเภทลายเซ็น
   * @returns รูปภาพเป็น ArrayBuffer หรือ null ถ้าไม่พบ
   */
  async getSignature(
    contractId: string,
    signatureType: 'client' | 'contractor' | 'witness1' | 'witness2'
  ): Promise<ArrayBuffer | null> {
    const key = `signatures/${contractId}/${signatureType}.png`;
    const object = await this.bucket.get(key);
    
    if (!object) {
      return null;
    }
    
    return await object.arrayBuffer();
  }

  /**
   * ลบรูปลายเซ็น
   * @param contractId - ID ของสัญญา
   * @param signatureType - ประเภทลายเซ็น
   */
  async deleteSignature(
    contractId: string,
    signatureType: 'client' | 'contractor' | 'witness1' | 'witness2'
  ): Promise<void> {
    const key = `signatures/${contractId}/${signatureType}.png`;
    await this.bucket.delete(key);
  }

  // ==================== Batch Operations ====================

  /**
   * ลบไฟล์ทั้งหมดที่เกี่ยวข้องกับสัญญา
   * @param contractId - ID ของสัญญา
   */
  async deleteAllContractFiles(contractId: string): Promise<void> {
    // ลบ PDF
    await this.deletePDF(contractId);
    
    // ลบลายเซ็นทั้งหมด
    const signatureTypes: Array<'client' | 'contractor' | 'witness1' | 'witness2'> = [
      'client',
      'contractor',
      'witness1',
      'witness2',
    ];
    
    await Promise.all(
      signatureTypes.map(type => this.deleteSignature(contractId, type))
    );
  }

  /**
   * ดึงรายการไฟล์ทั้งหมดในโฟลเดอร์
   * @param prefix - prefix ของโฟลเดอร์ (เช่น 'contracts/', 'signatures/')
   * @param limit - จำนวนไฟล์สูงสุดที่จะดึง (default: 1000)
   */
  async listFiles(prefix: string, limit: number = 1000): Promise<R2Objects> {
    return await this.bucket.list({
      prefix: prefix,
      limit: limit,
    });
  }

  // ==================== Utility Methods ====================

  /**
   * ดึงขนาดของไฟล์
   * @param key - key ของไฟล์ใน R2
   * @returns ขนาดไฟล์เป็น bytes หรือ null ถ้าไม่พบ
   */
  async getFileSize(key: string): Promise<number | null> {
    const object = await this.bucket.head(key);
    return object ? object.size : null;
  }

  /**
   * ตรวจสอบว่ามีไฟล์หรือไม่
   * @param key - key ของไฟล์ใน R2
   */
  async fileExists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key);
    return object !== null;
  }

  /**
   * คำนวณพื้นที่ใช้งานทั้งหมด
   * @param prefix - prefix ของโฟลเดอร์ที่ต้องการคำนวณ
   * @returns ขนาดรวมเป็น bytes
   */
  async calculateStorageUsage(prefix: string = ''): Promise<number> {
    const objects = await this.listFiles(prefix);
    let totalSize = 0;
    
    for (const object of objects.objects) {
      totalSize += object.size;
    }
    
    return totalSize;
  }
}

