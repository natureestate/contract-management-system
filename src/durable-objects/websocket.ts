// Cloudflare Durable Object สำหรับ WebSocket
// แทนที่ Socket.IO ด้วย native WebSocket API

import type { Env, WebSocketMessage } from '@/types/cloudflare';

/**
 * Session Information
 * เก็บข้อมูลของแต่ละ WebSocket connection
 */
interface SessionInfo {
  id: string;
  connectedAt: string;
  lastPing?: string;
}

/**
 * WebSocket Durable Object
 * จัดการ WebSocket connections และ real-time communication
 */
export class WebSocketDurableObject {
  private sessions: Map<WebSocket, SessionInfo>;
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    
    // Block concurrent inputs while restoring state
    this.state.blockConcurrencyWhile(async () => {
      // ถ้ามี state ที่ persist ไว้ ให้โหลดกลับมา
      // (สำหรับ Durable Objects ที่ต้องการ persistence)
    });
  }

  /**
   * Handle HTTP requests และ WebSocket upgrades
   */
  async fetch(request: Request): Promise<Response> {
    // ตรวจสอบว่าเป็น WebSocket upgrade request หรือไม่
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // สร้าง WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept WebSocket connection
    this.state.acceptWebSocket(server);

    // Setup session
    const sessionId = crypto.randomUUID();
    const sessionInfo: SessionInfo = {
      id: sessionId,
      connectedAt: new Date().toISOString(),
    };
    this.sessions.set(server, sessionInfo);

    // ส่ง welcome message
    this.sendMessage(server, {
      type: 'welcome',
      message: 'Connected to WebSocket server',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    });

    console.log(`Client connected: ${sessionId}`);

    // Return response with WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const session = this.sessions.get(ws);
      if (!session) {
        console.error('Session not found for WebSocket');
        return;
      }

      // Parse message
      let data: WebSocketMessage;
      if (typeof message === 'string') {
        data = JSON.parse(message);
      } else {
        // Handle binary messages if needed
        console.log('Received binary message');
        return;
      }

      console.log(`Message from ${session.id}:`, data);

      // Handle different message types
      switch (data.type) {
        case 'ping':
          // Respond to ping with pong
          this.sendMessage(ws, {
            type: 'pong',
            timestamp: new Date().toISOString(),
          });
          this.sessions.set(ws, {
            ...session,
            lastPing: new Date().toISOString(),
          });
          break;

        case 'message':
          // Broadcast message to all connected clients
          this.broadcast({
            type: 'message',
            data: data.data,
            timestamp: new Date().toISOString(),
          }, ws); // Exclude sender
          break;

        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to process message',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle WebSocket close
   */
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    const session = this.sessions.get(ws);
    if (session) {
      console.log(`Client disconnected: ${session.id} (code: ${code}, reason: ${reason})`);
      this.sessions.delete(ws);
    }
    
    // Close the WebSocket
    ws.close(code, reason);
  }

  /**
   * Handle WebSocket errors
   */
  async webSocketError(ws: WebSocket, error: Error): Promise<void> {
    const session = this.sessions.get(ws);
    console.error(`WebSocket error for session ${session?.id}:`, error);
    
    // Clean up session
    this.sessions.delete(ws);
  }

  // ==================== Helper Methods ====================

  /**
   * ส่งข้อความไปยัง WebSocket connection เดียว
   */
  private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Broadcast ข้อความไปยัง clients ทั้งหมด
   * @param message - ข้อความที่จะส่ง
   * @param excludeWs - WebSocket ที่ไม่ต้องการส่งไป (เช่น sender)
   */
  private broadcast(message: WebSocketMessage, excludeWs?: WebSocket): void {
    const connections = this.state.getWebSockets();
    
    for (const ws of connections) {
      if (ws !== excludeWs) {
        this.sendMessage(ws, message);
      }
    }
  }

  /**
   * ดึงจำนวน active connections
   */
  getActiveConnectionsCount(): number {
    return this.sessions.size;
  }

  /**
   * ดึงรายการ sessions ทั้งหมด
   */
  getSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  /**
   * ปิด connections ทั้งหมด
   */
  closeAllConnections(): void {
    const connections = this.state.getWebSockets();
    
    for (const ws of connections) {
      ws.close(1000, 'Server shutting down');
    }
    
    this.sessions.clear();
  }

  /**
   * Alarm handler (สำหรับ scheduled tasks)
   * เช่น cleanup inactive connections
   */
  async alarm(): Promise<void> {
    console.log('Alarm triggered - cleaning up inactive connections');
    
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes
    
    for (const [ws, session] of this.sessions.entries()) {
      if (session.lastPing) {
        const lastPingTime = new Date(session.lastPing).getTime();
        if (now.getTime() - lastPingTime > timeout) {
          console.log(`Closing inactive connection: ${session.id}`);
          ws.close(1000, 'Connection timeout');
          this.sessions.delete(ws);
        }
      }
    }
    
    // Schedule next alarm (every 5 minutes)
    await this.state.storage.setAlarm(Date.now() + timeout);
  }
}

