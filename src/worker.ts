// Cloudflare Worker Entry Point
// Main worker สำหรับจัดการ requests ทั้งหมด

import { D1Client } from '@/lib/d1-client';
import { R2Storage } from '@/lib/r2-storage';
import type { Env } from '@/types/cloudflare';
import { WebSocketDurableObject } from '@/durable-objects/websocket';

// Export Durable Object
export { WebSocketDurableObject };

/**
 * Main Worker Export
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // WebSocket routing
      if (url.pathname === '/api/websocket') {
        return handleWebSocket(request, env);
      }

      // API routing
      if (url.pathname.startsWith('/api/')) {
        const response = await handleAPI(request, env);
        // Add CORS headers to API responses
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // Static assets / Next.js pages
      // ในโปรเจกต์จริง ต้อง serve static files จาก build output
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

/**
 * Handle WebSocket connections
 */
async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  // Get Durable Object instance
  const id = env.WEBSOCKET.idFromName('global');
  const stub = env.WEBSOCKET.get(id);
  
  // Forward request to Durable Object
  return stub.fetch(request);
}

/**
 * Handle API requests
 */
async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const db = new D1Client(env.DB);
  const storage = new R2Storage(env.STORAGE);

  // Health check endpoint
  if (url.pathname === '/api/health' && request.method === 'GET') {
    const dbHealthy = await db.healthCheck();
    return Response.json({
      status: 'ok',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }

  // ==================== Contracts API ====================

  // GET /api/contracts - ดึงรายการสัญญาทั้งหมด
  if (url.pathname === '/api/contracts' && request.method === 'GET') {
    const contracts = await db.getContracts();
    return Response.json(contracts);
  }

  // POST /api/contracts - สร้างสัญญาใหม่
  if (url.pathname === '/api/contracts' && request.method === 'POST') {
    const data = await request.json();
    const contract = await db.createContract(data);
    return Response.json(contract, { status: 201 });
  }

  // GET /api/contracts/:id - ดึงข้อมูลสัญญา 1 รายการ
  const contractIdMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)$/);
  if (contractIdMatch && request.method === 'GET') {
    const id = contractIdMatch[1];
    const contract = await db.getContract(id);
    
    if (!contract) {
      return Response.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    return Response.json(contract);
  }

  // PUT /api/contracts/:id - แก้ไขข้อมูลสัญญา
  if (contractIdMatch && request.method === 'PUT') {
    const id = contractIdMatch[1];
    const data = await request.json();
    const contract = await db.updateContract(id, data);
    return Response.json(contract);
  }

  // DELETE /api/contracts/:id - ลบสัญญา
  if (contractIdMatch && request.method === 'DELETE') {
    const id = contractIdMatch[1];
    await db.deleteContract(id);
    // ลบไฟล์ที่เกี่ยวข้องด้วย
    await storage.deleteAllContractFiles(id);
    return Response.json({ success: true });
  }

  // GET /api/contracts/:id/pdf - ดาวน์โหลด PDF
  const pdfMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)\/pdf$/);
  if (pdfMatch && request.method === 'GET') {
    const id = pdfMatch[1];
    const pdfBuffer = await storage.getPDF(id);
    
    if (!pdfBuffer) {
      return Response.json({ error: 'PDF not found' }, { status: 404 });
    }
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${id}.pdf"`,
      },
    });
  }

  // POST /api/contracts/:id/pdf - อัพโหลด PDF
  if (pdfMatch && request.method === 'POST') {
    const id = pdfMatch[1];
    const pdfBuffer = await request.arrayBuffer();
    const key = await storage.uploadPDF(id, pdfBuffer);
    return Response.json({ success: true, key });
  }

  // ==================== Clients API ====================

  // GET /api/clients - ดึงรายการลูกค้าทั้งหมด
  if (url.pathname === '/api/clients' && request.method === 'GET') {
    const clients = await db.getClients();
    return Response.json(clients);
  }

  // POST /api/clients - สร้างลูกค้าใหม่
  if (url.pathname === '/api/clients' && request.method === 'POST') {
    const data = await request.json();
    const client = await db.createClient(data);
    return Response.json(client, { status: 201 });
  }

  // GET /api/clients/:id - ดึงข้อมูลลูกค้า 1 รายการ
  const clientIdMatch = url.pathname.match(/^\/api\/clients\/([^/]+)$/);
  if (clientIdMatch && request.method === 'GET') {
    const id = clientIdMatch[1];
    const client = await db.getClient(id);
    
    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return Response.json(client);
  }

  // PUT /api/clients/:id - แก้ไขข้อมูลลูกค้า
  if (clientIdMatch && request.method === 'PUT') {
    const id = clientIdMatch[1];
    const data = await request.json();
    const client = await db.updateClient(id, data);
    return Response.json(client);
  }

  // DELETE /api/clients/:id - ลบลูกค้า
  if (clientIdMatch && request.method === 'DELETE') {
    const id = clientIdMatch[1];
    await db.deleteClient(id);
    return Response.json({ success: true });
  }

  // ==================== Signatures API ====================

  // POST /api/contracts/:id/signatures/:type - อัพโหลดลายเซ็น
  const signatureMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)\/signatures\/(client|contractor|witness1|witness2)$/);
  if (signatureMatch && request.method === 'POST') {
    const [, contractId, signatureType] = signatureMatch;
    const imageBuffer = await request.arrayBuffer();
    const key = await storage.uploadSignature(
      contractId,
      signatureType as any,
      imageBuffer
    );
    return Response.json({ success: true, key });
  }

  // GET /api/contracts/:id/signatures/:type - ดาวน์โหลดลายเซ็น
  if (signatureMatch && request.method === 'GET') {
    const [, contractId, signatureType] = signatureMatch;
    const imageBuffer = await storage.getSignature(
      contractId,
      signatureType as any
    );
    
    if (!imageBuffer) {
      return Response.json({ error: 'Signature not found' }, { status: 404 });
    }
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }

  // Not found
  return Response.json({ error: 'Not Found' }, { status: 404 });
}

