# ✅ Cloudflare Deployment Checklist

คู่มือตรวจสอบขั้นตอนการ deploy แบบละเอียด ติ๊กถูก ✅ เมื่อทำเสร็จแต่ละขั้นตอน

---

## 📋 Pre-Deployment Checklist

### ข้อกำหนดเบื้องต้น

- [ ] มีบัญชี Cloudflare แล้ว (สมัครที่ [cloudflare.com](https://cloudflare.com))
- [ ] Email ยืนยันแล้ว
- [ ] Node.js 18+ ติดตั้งแล้ว (`node --version`)
- [ ] npm ใช้งานได้ (`npm --version`)
- [ ] Git ติดตั้งแล้ว (ถ้าต้องการ version control)

### ตรวจสอบโปรเจกต์

- [ ] `npm install` เสร็จแล้ว (ไม่มี errors)
- [ ] Local dev server ทำงาน: `npm run dev`
- [ ] Database มีข้อมูล (ถ้าต้องการ migrate)
- [ ] ไม่มี linter errors: `npm run lint`

---

## 🚀 Step-by-Step Deployment

### Step 1: Login เข้า Cloudflare

```bash
npm run cf:login
```

**Expected Output:**
```
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/...
Successfully logged in.
```

**Checklist:**
- [ ] Browser เปิดขึ้น
- [ ] กด "Allow" ใน Cloudflare
- [ ] เห็น "Successfully logged in"
- [ ] ทดสอบ: `npx wrangler whoami` แสดงข้อมูลบัญชี

---

### Step 2: สร้าง D1 Database

```bash
npm run cf:d1:create
```

**Expected Output:**
```
✅ Successfully created DB 'contract-db'

[[d1_databases]]
binding = "DB"
database_name = "contract-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Checklist:**
- [ ] เห็น "Successfully created DB"
- [ ] คัดลอก `database_id` ทั้งหมด
- [ ] เปิดไฟล์ `wrangler.toml`
- [ ] วาง `database_id` ในบรรทัดที่ 18 (แทนที่ `""`)
- [ ] บันทึกไฟล์
- [ ] ตรวจสอบ: `npm run cf:d1:list` เห็น database

**ไฟล์ wrangler.toml ควรเป็น:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "contract-db"
database_id = "abc-def-123"  # ← ID ที่คัดลอกมา
```

---

### Step 3: Apply Database Schema

```bash
npm run cf:d1:execute
```

**Expected Output:**
```
🌀 Executing on contract-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🚣 Executed 3 commands in 0.5s
```

**Checklist:**
- [ ] เห็น "Executed X commands"
- [ ] ไม่มี error messages
- [ ] ตรวจสอบ tables:
  ```bash
  npx wrangler d1 execute contract-db --command "SELECT name FROM sqlite_master WHERE type='table'"
  ```
- [ ] เห็น tables: User, Client, Contract

---

### Step 4: สร้าง R2 Bucket

```bash
npm run cf:r2:create
```

**Expected Output:**
```
✅ Created bucket 'contract-files'
```

**Checklist:**
- [ ] เห็น "Created bucket"
- [ ] ตรวจสอบ: `npm run cf:r2:list` เห็น bucket

---

### Step 5: ทดสอบ Local (Optional แต่แนะนำ)

```bash
npm run cf:dev
```

**Expected Output:**
```
⎔ Starting local server...
[mf:inf] Ready on http://localhost:8787
```

**Checklist:**
- [ ] Server รันที่ port 8787
- [ ] เปิด browser: `http://localhost:8787/api/health`
- [ ] เห็น JSON response:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "timestamp": "..."
  }
  ```
- [ ] ทดสอบ API endpoints (curl/Postman)
- [ ] กด Ctrl+C เพื่อหยุด server

---

### Step 6: Deploy to Production 🎉

```bash
npm run cf:deploy
```

**Expected Output:**
```
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded pospro-contract (1.23 sec)
Published pospro-contract (0.45 sec)
  https://pospro-contract.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Checklist:**
- [ ] เห็น "Published pospro-contract"
- [ ] คัดลอก URL ที่ได้
- [ ] บันทึก URL ไว้ในที่ปลอดภัย

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check

```bash
curl https://YOUR-WORKER-URL/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-20T..."
}
```

- [ ] Status = "ok"
- [ ] Database = "connected"

---

### Test 2: Create Client

```bash
curl -X POST https://YOUR-WORKER-URL/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "บริษัท ทดสอบ จำกัด",
    "type": "company",
    "address": "123 ถนนทดสอบ",
    "phone": "02-123-4567",
    "email": "test@example.com"
  }'
```

**Expected:** JSON response พร้อม `id` ของ client

- [ ] Response status 201
- [ ] มี `id` field
- [ ] ข้อมูลครบถ้วน

---

### Test 3: Get Clients

```bash
curl https://YOUR-WORKER-URL/api/clients
```

**Expected:** Array ของ clients (อย่างน้อย 1 รายการจาก Test 2)

- [ ] Response status 200
- [ ] เป็น array
- [ ] มีข้อมูลที่สร้างไว้

---

### Test 4: Create Contract

```bash
curl -X POST https://YOUR-WORKER-URL/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "contractNumber": "C001",
    "location": "กรุงเทพฯ",
    "contractDate": "2025-10-20T00:00:00.000Z",
    "clientId": "CLIENT_ID_FROM_TEST_2",
    "contractorName": "บริษัท ผู้รับเหมา จำกัด",
    "contractorType": "company",
    "contractorAddress": "456 ถนนรับเหมา",
    "buildingType": "บ้านเดี่ยว",
    "buildingFloors": "2",
    "buildingArea": "200",
    "projectLocation": "กรุงเทพฯ",
    "totalFee": 1000000,
    "paymentTerms": "ผ่อน 3 งวด"
  }'
```

**Note:** แทนที่ `CLIENT_ID_FROM_TEST_2` ด้วย ID ที่ได้จาก Test 2

- [ ] Response status 201
- [ ] มี contract data ครบถ้วน
- [ ] มี client relation

---

### Test 5: WebSocket (Optional)

สร้างไฟล์ `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head><title>WebSocket Test</title></head>
<body>
  <h1>WebSocket Test</h1>
  <div id="status">Connecting...</div>
  <script>
    const ws = new WebSocket('wss://YOUR-WORKER-URL/api/websocket');
    ws.onopen = () => {
      document.getElementById('status').textContent = '✅ Connected!';
    };
    ws.onmessage = (e) => {
      console.log('Received:', JSON.parse(e.data));
    };
    ws.onerror = () => {
      document.getElementById('status').textContent = '❌ Error';
    };
  </script>
</body>
</html>
```

- [ ] เปิดไฟล์ใน browser
- [ ] เห็น "✅ Connected!"
- [ ] Console แสดง welcome message

---

## 📊 Monitoring Setup

### Cloudflare Dashboard

1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com)
2. คลิก **Workers & Pages**
3. คลิกที่ `pospro-contract`

**Checklist:**
- [ ] เห็น worker name
- [ ] เห็น "Active" status
- [ ] เห็น production URL
- [ ] Metrics แสดงข้อมูล (อาจใช้เวลาสักครู่)

### Real-time Logs

```bash
npm run cf:tail
```

- [ ] Logs streaming ทำงาน
- [ ] เห็น requests เมื่อเรียก API
- [ ] เห็น response codes

---

## 🔧 Configuration Checklist

### Environment Variables

**Local (.dev.vars):**
- [ ] DATABASE_URL มีค่าถูกต้อง
- [ ] NODE_ENV = "development"

**Production (Cloudflare Dashboard):**
- [ ] ไป Settings → Variables
- [ ] NODE_ENV = "production" (optional)
- [ ] Secret variables (ถ้ามี)

### Bindings

ใน Cloudflare Dashboard → Settings → Bindings:

- [ ] **D1 Database**:
  - Name: `DB`
  - Database: `contract-db`
- [ ] **R2 Bucket**:
  - Name: `STORAGE`
  - Bucket: `contract-files`
- [ ] **Durable Object**:
  - Name: `WEBSOCKET`
  - Class: `WebSocketDurableObject`

---

## 📈 Usage Monitoring

### Day 1 Check (หลัง deploy 24 ชั่วโมง)

ใน Cloudflare Dashboard → Metrics:

- [ ] Requests count < 100,000
- [ ] Success rate > 99%
- [ ] Average CPU time < 10ms
- [ ] No errors หรือ minimal errors

### Week 1 Check

- [ ] D1 reads < 5,000,000/day
- [ ] D1 writes < 100,000/day
- [ ] R2 storage < 10GB
- [ ] R2 operations < 1,000,000/month

---

## 🚨 Troubleshooting

### ถ้า Deploy Failed

```bash
# 1. ตรวจสอบ wrangler.toml
cat wrangler.toml

# 2. ดู logs
npm run cf:tail

# 3. ลอง deploy อีกครั้ง
npm run cf:deploy
```

### ถ้า Database Error

```bash
# 1. ตรวจสอบ database_id
npm run cf:d1:list

# 2. ตรวจสอบ tables
npx wrangler d1 execute contract-db --command "SELECT name FROM sqlite_master WHERE type='table'"

# 3. Apply schema อีกครั้ง (ถ้าจำเป็น)
npm run cf:d1:execute
```

### ถ้า API ไม่ทำงาน

```bash
# 1. ดู real-time logs
npm run cf:tail

# 2. ทดสอบ health endpoint
curl https://YOUR-WORKER-URL/api/health

# 3. ตรวจสอบ CORS (ถ้าเรียกจาก browser)
```

---

## 📝 Final Checklist

### Deployment Complete

- [ ] ✅ Worker deployed successfully
- [ ] ✅ D1 database working
- [ ] ✅ R2 bucket created
- [ ] ✅ Health check ผ่าน
- [ ] ✅ CRUD operations ทำงาน
- [ ] ✅ WebSocket เชื่อมต่อได้
- [ ] ✅ Logs streaming ทำงาน
- [ ] ✅ บันทึก production URL

### Documentation

- [ ] 📖 บันทึก production URL
- [ ] 📖 บันทึก database_id
- [ ] 📖 เอกสารการใช้งาน API
- [ ] 📖 แชร์ URL กับทีม

### Security

- [ ] 🔐 ตรวจสอบ CORS settings
- [ ] 🔐 Environment variables ปลอดภัย
- [ ] 🔐 API validation ครบถ้วน

---

## 🎉 Success!

ถ้าทุกอย่างติ๊กถูกหมดแล้ว **ยินดีด้วย!** 🎊

โปรเจกต์ของคุณพร้อมใช้งานบน Cloudflare แล้ว

**Production URL:** `https://pospro-contract.YOUR-SUBDOMAIN.workers.dev`

**ขั้นตอนถัดไป:**
1. Setup custom domain (optional)
2. Monitor usage ประจำวัน
3. Optimize performance
4. เพิ่ม features ใหม่

---

## 📞 Support

### เอกสารเพิ่มเติม
- 📚 `CLOUDFLARE_DEPLOYMENT.md` - คู่มือเต็ม
- ⚡ `QUICKSTART_CLOUDFLARE.md` - Quick start
- ☁️ `CLOUDFLARE_README.md` - Overview
- 🏗️ `agent.md` - Architecture

### Cloudflare Resources
- [Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [R2 Docs](https://developers.cloudflare.com/r2/)
- [Community Discord](https://discord.gg/cloudflaredev)

---

**Last Updated:** 2025-10-20  
**Estimated Time:** 15-30 นาที (ครั้งแรก)  
**Cost:** 💰 $0 (Free Tier)

