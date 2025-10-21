# 🎨 Frontend Deployment - Cloudflare Pages

**สถานะ:** ✅ Deploy สำเร็จ แต่ต้องตั้งค่าเพิ่มเติม

---

## 📊 สรุปการ Deploy

### ✅ สิ่งที่ทำเสร็จแล้ว

1. **แก้ไข API Routes** - เปลี่ยนเป็น Edge Runtime
   - ✅ `/api/health`
   - ✅ `/api/clients`
   - ✅ `/api/clients/[id]`
   - ✅ `/api/contracts`
   - ✅ `/api/contracts/[id]`
   - ✅ `/api/contracts/[id]/pdf`

2. **Build สำเร็จ**
   - ✅ Next.js build completed
   - ✅ `@cloudflare/next-on-pages` build completed
   - ✅ Edge Function Routes: 6
   - ✅ Prerendered Routes: 3
   - ✅ Static Assets: 38

3. **Deploy สำเร็จ**
   - ✅ Uploaded to Cloudflare Pages
   - ✅ URL: https://f493c9c6.pospro-contract.pages.dev

---

## ⚠️ ปัญหาที่พบ

### Error: nodejs_compat compatibility flag

Frontend ต้องการ `nodejs_compat` compatibility flag เพื่อให้ทำงานได้ถูกต้อง

**Error Message:**
```
Error - no nodejs_compat compatibility flag
```

---

## 🔧 วิธีแก้ไข

### ขั้นตอนที่ 1: เข้า Cloudflare Dashboard

1. ไปที่ https://dash.cloudflare.com
2. เลือก Account ของคุณ
3. ไปที่ **Workers & Pages**
4. เลือก **pospro-contract**

### ขั้นตอนที่ 2: ตั้งค่า Compatibility Flags

1. ไปที่แท็บ **Settings**
2. เลื่อนลงไปที่ **Functions**
3. หา **Compatibility flags**
4. คลิก **Configure Compatibility Flags**
5. เพิ่ม flag: `nodejs_compat`
6. คลิก **Save**

### ขั้นตอนที่ 3: Re-deploy

หลังจากตั้งค่า compatibility flags แล้ว ต้อง re-deploy:

```bash
npm run pages:deploy
```

---

## 🎯 หลัง Deploy แล้ว

### 1. ทดสอบ Frontend

```bash
# เปิดในเบราว์เซอร์
open https://f493c9c6.pospro-contract.pages.dev

# หรือทดสอบด้วย curl
curl https://f493c9c6.pospro-contract.pages.dev/api/health
```

### 2. ตั้งค่า Environment Variables

ต้องตั้งค่า `NEXT_PUBLIC_WORKER_API_URL` ให้ชี้ไปยัง Worker API:

1. ไปที่ **Settings** > **Environment variables**
2. เพิ่ม variable:
   - **Name:** `NEXT_PUBLIC_WORKER_API_URL`
   - **Value:** `https://pospro-contract.YOUR-SUBDOMAIN.workers.dev`
3. คลิก **Save**
4. Re-deploy อีกครั้ง

---

## 📝 สรุป Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Cloudflare Pages (Frontend)                       │
│  https://f493c9c6.pospro-contract.pages.dev       │
│                                                     │
│  - Next.js 15 with App Router                      │
│  - Edge Runtime API Routes (Proxy)                 │
│  - Static Assets                                    │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Cloudflare Worker (Backend API)                   │
│  https://pospro-contract.YOUR-SUBDOMAIN.workers.dev│
│                                                     │
│  - D1 Database (SQLite)                            │
│  - R2 Storage (Files)                              │
│  - Durable Objects (WebSocket)                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 การทดสอบ

### Test 1: Health Check
```bash
curl https://f493c9c6.pospro-contract.pages.dev/api/health
```

**Expected Response:**
```json
{
  "message": "Good!",
  "status": "ok",
  "timestamp": "2025-10-21T..."
}
```

### Test 2: Get Clients
```bash
curl https://f493c9c6.pospro-contract.pages.dev/api/clients
```

### Test 3: Get Contracts
```bash
curl https://f493c9c6.pospro-contract.pages.dev/api/contracts
```

---

## 📚 เอกสารเพิ่มเติม

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Compatibility Flags](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)

---

**Last Updated:** 2025-10-21  
**Status:** ⚠️ ต้องตั้งค่า nodejs_compat flag

