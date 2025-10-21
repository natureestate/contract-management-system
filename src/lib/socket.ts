// WebSocket Client สำหรับ Cloudflare Durable Objects
// แทนที่ Socket.IO ด้วย native WebSocket API

import type { WebSocketMessage } from '@/types/cloudflare';

/**
 * WebSocket Client Class
 * ใช้สำหรับเชื่อมต่อกับ Cloudflare Durable Objects WebSocket
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private url?: string) {
    // Auto-detect URL based on environment
    if (!url) {
      this.url = this.getWebSocketURL();
    }
  }

  /**
   * ดึง WebSocket URL ตาม environment
   */
  private getWebSocketURL(): string {
    if (typeof window === 'undefined') {
      // Server-side
      return 'ws://localhost:8787/api/websocket';
    }

    // Client-side
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Development
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'ws://localhost:8787/api/websocket';
    }
    
    // Production (Cloudflare Workers)
    return `${protocol}//${host}/api/websocket`;
  }

  /**
   * เชื่อมต่อ WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket:', this.url);
        this.ws = new WebSocket(this.url!);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.stopPingInterval();
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * จัดการข้อความที่ได้รับ
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      console.log('Received message:', message);

      // เรียก handler ที่ register ไว้
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }

      // เรียก handler ทั่วไป (ถ้ามี)
      const allHandler = this.messageHandlers.get('*');
      if (allHandler) {
        allHandler(message);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  /**
   * ส่งข้อความ
   */
  send(type: string, data?: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Register message handler
   */
  on(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove message handler
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * ปิดการเชื่อมต่อ
   */
  disconnect(): void {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * พยายามเชื่อมต่อใหม่
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * เริ่ม ping interval เพื่อ keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * หยุด ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Export singleton instance
let wsClient: WebSocketClient | null = null;

/**
 * ดึง WebSocket client instance (singleton)
 */
export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}

/**
 * สร้าง WebSocket client instance ใหม่
 */
export function createWebSocketClient(url?: string): WebSocketClient {
  return new WebSocketClient(url);
}