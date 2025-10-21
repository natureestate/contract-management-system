import { NextResponse } from "next/server";

// หมายเหตุ: ไม่ใช้ edge runtime เพราะ Prisma ต้องการ Node.js runtime
// สำหรับ Cloudflare deployment ให้ใช้ Workers API แทน

export async function GET() {
  return NextResponse.json({ message: "Good!" });
}