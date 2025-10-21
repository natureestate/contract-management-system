import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // สำหรับ Cloudflare Workers deployment
  // หมายเหตุ: ไม่ใช้ static export เพราะมี API routes
  // แทนที่จะใช้ Cloudflare Pages หรือ Workers with assets
  
  // Image optimization
  images: {
    unoptimized: true, // Cloudflare Images จะจัดการเอง
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // สำหรับ local development
  reactStrictMode: false,
  
  webpack: (config, { dev }) => {
    if (dev) {
      // ปิด webpack hot reload (ใช้ nodemon แทน)
      config.watchOptions = {
        ignored: ['**/*'],
      };
    }
    return config;
  },
};

export default nextConfig;
