# 🚀 Cloudflare Deployment Guide

คู่มือการ deploy โปรเจกต์ Contract Management System ไปยัง Cloudflare Workers

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [การติดตั้งและตั้งค่า](#การติดตั้งและตั้งค่า)
3. [การสร้าง Cloudflare Resources](#การสร้าง-cloudflare-resources)
4. [การ Migrate Database](#การ-migrate-database)
5. [การ Deploy](#การ-deploy)
6. [การทดสอบ](#การทดสอบ)
7. [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดเบื้องต้น

### บัญชี Cloudflare
- สมัครบัญชี Cloudflare ที่ [cloudflare.com](https://cloudflare.com)
- ยืนยันอีเมล
- ไม่ต้องใส่ข้อมูลบัตรเครดิต (ใช้ free tier ได้เลย)

### เครื่องมือที่ต้องติดตั้ง
- Node.js 18+ และ npm
- Git
- Wrangler CLI (จะติดตั้งในขั้นตอนถัดไป)

---

## การติดตั้งและตั้งค่า

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ทั้งหมด (รวม wrangler)
npm install
```

### 2. Login เข้า Cloudflare

```bash
# Login ผ่าน browser
npm run cf:login

# หรือใช้คำสั่งนี้
npx wrangler login
```

เบราว์เซอร์จะเปิดขึ้นมา ให้กด "Allow" เพื่ออนุญาตให้ Wrangler เข้าถึงบัญชี Cloudflare

### 3. ตรวจสอบการ Login

```bash
# ตรวจสอบว่า login สำเร็จหรือไม่
npx wrangler whoami
```

ควรแสดงข้อมูลบัญชี Cloudflare ของคุณ

---

## การสร้าง Cloudflare Resources

### 1. สร้าง D1 Database

```bash
# สร้าง D1 database
npm run cf:d1:create

# หรือ
npx wrangler d1 create contract-db
```

**Output ตัวอย่าง:**
```
✅ Successfully created DB 'contract-db'

[[d1_databases]]
binding = "DB"
database_name = "contract-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**สำคัญ:** คัดลอก `database_id` และใส่ใน `wrangler.toml`

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "contract-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← ใส่ ID ที่ได้
```

### 2. สร้าง R2 Bucket

```bash
# สร้าง R2 bucket สำหรับเก็บไฟล์
npm run cf:r2:create

# หรือ
npx wrangler r2 bucket create contract-files
```

**Output:**
```
✅ Created bucket 'contract-files'
```

### 3. ตรวจสอบ Resources ที่สร้าง

```bash
# ดู D1 databases
npm run cf:d1:list

# ดู R2 buckets
npm run cf:r2:list
```

---

## การ Migrate Database

### 1. Generate SQL Schema

```bash
# Generate schema.sql จาก Prisma schema
npm run cf:schema
```

ไฟล์ `schema.sql` จะถูกสร้างขึ้นในโฟลเดอร์ root

### 2. Apply Schema ไป D1

```bash
# Apply schema ไปยัง D1 database
npm run cf:d1:execute

# หรือ
npx wrangler d1 execute contract-db --file=schema.sql
```

**Output:**
```
🌀 Executing on contract-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 execute'
🚣 Executed 3 commands in 0.5s
```

### 3. ตรวจสอบ Tables

```bash
# Query เพื่อดู tables
npx wrangler d1 execute contract-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

ควรเห็น tables: `User`, `Client`, `Contract`

### 4. Import ข้อมูลเดิม (ถ้ามี)

```bash
# Export ข้อมูลจาก SQLite ปัจจุบัน
sqlite3 db/custom.db .dump > backup.sql

# แก้ไข backup.sql ให้เข้ากับ D1 (ลบ BEGIN TRANSACTION, COMMIT ออก)
# จากนั้น import
npx wrangler d1 execute contract-db --file=backup.sql
```

---

## การ Deploy

### 1. ทดสอบ Local Development

```bash
# รัน Wrangler dev server
npm run cf:dev
```

Server จะรันที่ `http://localhost:8787`

**ทดสอบ API:**
```bash
# Health check
curl http://localhost:8787/api/health

# ดึงรายการ contracts
curl http://localhost:8787/api/contracts

# ดึงรายการ clients
curl http://localhost:8787/api/clients
```

### 2. Deploy ไป Production

```bash
# Deploy worker ไปยัง Cloudflare
npm run cf:deploy

# หรือ
npx wrangler deploy
```

**Output:**
```
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded pospro-contract (x.xx sec)
Published pospro-contract (x.xx sec)
  https://pospro-contract.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. ตรวจสอบ Deployment

เปิด URL ที่ได้จาก output:
```
https://pospro-contract.your-subdomain.workers.dev/api/health
```

ควรเห็น:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-20T..."
}
```

---

## การทดสอบ

### ทดสอบ API Endpoints

#### 1. Health Check
```bash
curl https://pospro-contract.your-subdomain.workers.dev/api/health
```

#### 2. สร้าง Client
```bash
curl -X POST https://pospro-contract.your-subdomain.workers.dev/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "บริษัท ทดสอบ จำกัด",
    "type": "company",
    "address": "123 ถนนทดสอบ",
    "phone": "02-123-4567",
    "email": "test@example.com"
  }'
```

#### 3. ดึงรายการ Clients
```bash
curl https://pospro-contract.your-subdomain.workers.dev/api/clients
```

#### 4. สร้าง Contract
```bash
curl -X POST https://pospro-contract.your-subdomain.workers.dev/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "contractNumber": "C001",
    "location": "กรุงเทพฯ",
    "contractDate": "2025-10-20T00:00:00.000Z",
    "clientId": "CLIENT_ID_HERE",
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

### ทดสอบ WebSocket

สร้างไฟล์ HTML ทดสอบ:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
</head>
<body>
  <h1>WebSocket Test</h1>
  <div id="status">Disconnected</div>
  <button onclick="connect()">Connect</button>
  <button onclick="sendMessage()">Send Message</button>
  <div id="messages"></div>

  <script>
    let ws;

    function connect() {
      ws = new WebSocket('wss://pospro-contract.your-subdomain.workers.dev/api/websocket');
      
      ws.onopen = () => {
        document.getElementById('status').textContent = 'Connected';
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const div = document.createElement('div');
        div.textContent = JSON.stringify(data);
        document.getElementById('messages').appendChild(div);
      };
      
      ws.onclose = () => {
        document.getElementById('status').textContent = 'Disconnected';
      };
    }

    function sendMessage() {
      ws.send(JSON.stringify({
        type: 'message',
        data: { text: 'Hello from client!' }
      }));
    }
  </script>
</body>
</html>
```

---

## การดู Logs และ Monitoring

### Real-time Logs

```bash
# ดู logs แบบ real-time
npm run cf:tail

# หรือ
npx wrangler tail
```

### Cloudflare Dashboard

1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com)
2. เลือก **Workers & Pages**
3. คลิกที่ worker `pospro-contract`
4. ดู:
   - **Metrics**: Requests, Errors, CPU time
   - **Logs**: Real-time logs
   - **Settings**: Environment variables, Bindings

---

## Environment Variables

### Local Development (.dev.vars)

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### Production (Cloudflare Dashboard)

1. ไปที่ Worker Settings → Variables
2. เพิ่ม environment variables:
   - `NODE_ENV` = `production`
   - อื่นๆ ตามต้องการ

หรือใช้ command line:

```bash
# เพิ่ม secret
npx wrangler secret put NEXTAUTH_SECRET
```

---

## Troubleshooting

### ❌ Error: "Database not found"

**สาเหตุ:** `database_id` ใน `wrangler.toml` ไม่ถูกต้อง

**แก้ไข:**
1. รัน `npm run cf:d1:list` เพื่อดู database ID
2. อัพเดท `database_id` ใน `wrangler.toml`
3. Deploy ใหม่

### ❌ Error: "R2 bucket not found"

**สาเหตุ:** R2 bucket ยังไม่ได้สร้าง

**แก้ไข:**
```bash
npm run cf:r2:create
npx wrangler deploy
```

### ❌ Error: "Durable Object not found"

**สาเหตุ:** Durable Object migration ยังไม่รัน

**แก้ไข:**
1. ตรวจสอบ `[[migrations]]` ใน `wrangler.toml`
2. Deploy ใหม่ (migration จะรันอัตโนมัติ)

### ❌ WebSocket ไม่เชื่อมต่อ

**ตรวจสอบ:**
1. URL ต้องเป็น `wss://` (production) หรือ `ws://` (local)
2. ตรวจสอบ CORS settings
3. ดู logs: `npm run cf:tail`

### ❌ CPU Time Limit Exceeded

**สาเหตุ:** Request ใช้เวลา process นานเกิน 10ms (free tier)

**แก้ไข:**
1. Optimize database queries
2. ใช้ indexes
3. Cache ข้อมูลที่ query บ่อย
4. พิจารณา upgrade เป็น paid plan

---

## Free Tier Limits

### ✅ Cloudflare Workers
- **100,000 requests/day**
- **10ms CPU time per request**
- Unlimited bandwidth

### ✅ Cloudflare D1
- **5GB storage**
- **5,000,000 reads/day**
- **100,000 writes/day**

### ✅ Cloudflare R2
- **10GB storage**
- **1,000,000 Class A operations/month** (PUT, LIST)
- **10,000,000 Class B operations/month** (GET, HEAD)

### ✅ Cloudflare Durable Objects
- **1,000,000 requests/month**
- **400,000 GB-s duration/month**

---

## การ Monitor Usage

### Cloudflare Dashboard

1. ไปที่ **Workers & Pages** → เลือก worker
2. ดู **Metrics** tab:
   - Requests per day
   - Errors
   - CPU time
   - Success rate

### D1 Database Usage

```bash
# Query เพื่อดูจำนวน records
npx wrangler d1 execute contract-db --command "SELECT COUNT(*) FROM Contract"
npx wrangler d1 execute contract-db --command "SELECT COUNT(*) FROM Client"
```

### R2 Storage Usage

```bash
# ดูรายการไฟล์
npx wrangler r2 object list contract-files
```

---

## Best Practices

### 1. Database
- ใช้ indexes สำหรับ columns ที่ query บ่อย
- Limit results ด้วย `LIMIT` clause
- ใช้ `SELECT` เฉพาะ columns ที่ต้องการ

### 2. R2 Storage
- ตั้งชื่อไฟล์ให้เป็นระบบ (เช่น `contracts/{id}.pdf`)
- ใช้ metadata เพื่อเก็บข้อมูลเพิ่มเติม
- ตั้งค่า lifecycle rules สำหรับลบไฟล์เก่า

### 3. WebSocket
- Implement reconnection logic
- ใช้ ping/pong เพื่อ keep connection alive
- Handle errors gracefully

### 4. Security
- ใช้ environment variables สำหรับ secrets
- Validate input ทุกครั้ง
- Implement rate limiting
- ใช้ CORS อย่างเหมาะสม

---

## คำสั่งที่ใช้บ่อย

```bash
# Development
npm run cf:dev              # รัน local dev server
npm run cf:tail             # ดู real-time logs

# Database
npm run cf:d1:list          # ดู databases
npm run cf:d1:execute       # รัน SQL file
npm run cf:schema           # Generate schema.sql

# Storage
npm run cf:r2:list          # ดู R2 buckets

# Deployment
npm run cf:deploy           # Deploy ไป production
npm run cf:login            # Login เข้า Cloudflare

# Monitoring
npx wrangler tail           # Real-time logs
npx wrangler whoami         # ตรวจสอบ account
```

---

## ขั้นตอนถัดไป

1. ✅ Setup Custom Domain (ใน Cloudflare Dashboard)
2. ✅ เพิ่ม Authentication (NextAuth.js)
3. ✅ Implement PDF Generation
4. ✅ ตั้งค่า Email Notifications
5. ✅ เพิ่ม Analytics และ Monitoring
6. ✅ Implement Backup Strategy

---

## แหล่งข้อมูลเพิ่มเติม

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0

