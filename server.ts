// server.ts - Next.js Standalone Server (สำหรับ local development)
// หมายเหตุ: โปรเจกต์นี้ถูก migrate ไปใช้ Cloudflare Workers แล้ว
// server.ts นี้ใช้สำหรับ local development เท่านั้น
import { createServer } from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = 'localhost';

// Custom server สำหรับ local development
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer((req, res) => {
      handle(req, res);
    });

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Local development server (WebSocket ใช้ Cloudflare Workers)`);
      console.log(`> Production: https://pospro-contract.smeandme.workers.dev`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
