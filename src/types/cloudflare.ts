// Cloudflare Workers Types
// กำหนด types สำหรับ Cloudflare bindings และ environment

/**
 * Cloudflare Environment Bindings
 * ประกอบด้วย D1 Database, R2 Storage, และ Durable Objects
 */
export interface Env {
  // D1 Database binding
  DB: D1Database;
  
  // R2 Storage binding
  STORAGE: R2Bucket;
  
  // Durable Objects binding สำหรับ WebSocket
  WEBSOCKET: DurableObjectNamespace;
  
  // Environment variables
  NODE_ENV?: string;
  DATABASE_URL?: string;
}

/**
 * Contract Model Type
 * ตรงกับ Prisma schema
 */
export interface Contract {
  id: string;
  contractNumber: string;
  location: string;
  contractDate: string;
  clientId: string;
  contractorName: string;
  contractorType: string;
  contractorIdCard?: string | null;
  contractorRegistration?: string | null;
  contractorAddress: string;
  contractorPosition?: string | null;
  buildingType: string;
  buildingFloors: string;
  buildingArea: string;
  projectLocation: string;
  floorPlanDuration: number;
  threeDDuration: number;
  constructionDuration: number;
  totalFee: number;
  paymentTerms: string;
  witness1Name?: string | null;
  witness1Signature?: string | null;
  witness2Name?: string | null;
  witness2Signature?: string | null;
  clientSignature?: string | null;
  contractorSignature?: string | null;
  clientSignDate?: string | null;
  contractorSignDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client Model Type
 * ตรงกับ Prisma schema
 */
export interface Client {
  id: string;
  name: string;
  type: string;
  idCard?: string | null;
  registrationNo?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  contactPerson?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * WebSocket Message Types
 */
export interface WebSocketMessage {
  type: 'welcome' | 'message' | 'error' | 'ping' | 'pong';
  data?: any;
  message?: string;
  sessionId?: string;
  timestamp: string;
}

