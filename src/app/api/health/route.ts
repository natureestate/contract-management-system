import { NextResponse } from "next/server";

// Edge Runtime สำหรับ Cloudflare Pages
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ 
    message: "Good!",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}