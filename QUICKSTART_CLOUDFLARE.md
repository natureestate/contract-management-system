# ⚡ Quick Start - Cloudflare Deployment

คู่มือเริ่มต้นใช้งาน Cloudflare สำหรับโปรเจกต์ Contract Management (ฉบับย่อ)

## 🎯 เป้าหมาย

Deploy โปรเจกต์ไปยัง Cloudflare Workers (Free Tier) ภายใน 15 นาที

---

## ✅ Checklist ก่อนเริ่ม

- [ ] มีบัญชี Cloudflare (สมัครฟรีที่ [cloudflare.com](https://cloudflare.com))
- [ ] ติดตั้ง Node.js 18+ แล้ว
- [ ] Clone โปรเจกต์และ `npm install` แล้ว

---

## 🚀 ขั้นตอนการ Deploy (5 ขั้นตอน)

### 1️⃣ Login เข้า Cloudflare

```bash
npm run cf:login
```

เบราว์เซอร์จะเปิดขึ้น → กด **Allow**

### 2️⃣ สร้าง D1 Database

```bash
# สร้าง database
npm run cf:d1:create
```

**คัดลอก `database_id` จาก output** แล้วใส่ใน `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "contract-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← วางที่นี่
```

```bash
# Apply schema
npm run cf:d1:execute
```

### 3️⃣ สร้าง R2 Bucket

```bash
npm run cf:r2:create
```

### 4️⃣ ทดสอบ Local

```bash
npm run cf:dev
```

เปิดเบราว์เซอร์: `http://localhost:8787/api/health`

ควรเห็น:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 5️⃣ Deploy Production

```bash
npm run cf:deploy
```

**เสร็จแล้ว!** 🎉

URL จะแสดงใน output: `https://pospro-contract.YOUR-SUBDOMAIN.workers.dev`

---

## 🧪 ทดสอบ API

### Health Check
```bash
curl https://YOUR-WORKER-URL/api/health
```

### สร้าง Client
```bash
curl -X POST https://YOUR-WORKER-URL/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "บริษัท ทดสอบ จำกัด",
    "type": "company",
    "address": "123 ถนนทดสอบ"
  }'
```

### ดูรายการ Clients
```bash
curl https://YOUR-WORKER-URL/api/clients
```

---

## 📊 ตรวจสอบ Usage

ไปที่: [dash.cloudflare.com](https://dash.cloudflare.com)
→ **Workers & Pages** → เลือก `pospro-contract`

ดูได้:
- **Requests/day** (Free: 100,000)
- **CPU Time** (Free: 10ms/request)
- **D1 Reads/Writes** (Free: 5M reads, 100K writes/day)

---

## 🛠️ คำสั่งที่ใช้บ่อย

```bash
# ดู real-time logs
npm run cf:tail

# ดู databases
npm run cf:d1:list

# ดู R2 buckets
npm run cf:r2:list

# Query database
npx wrangler d1 execute contract-db --command "SELECT * FROM Client"

# ดู account info
npx wrangler whoami
```

---

## ❓ แก้ปัญหาเบื้องต้น

### Database not found
```bash
# ตรวจสอบ database_id
npm run cf:d1:list

# อัพเดทใน wrangler.toml แล้ว deploy ใหม่
npm run cf:deploy
```

### R2 bucket not found
```bash
npm run cf:r2:create
npm run cf:deploy
```

### Deploy failed
```bash
# ลองอีกครั้ง
npm run cf:deploy

# ถ้ายังไม่ได้ ดู logs
npm run cf:tail
```

---

## 📖 เอกสารเพิ่มเติม

- **คู่มือเต็ม**: `CLOUDFLARE_DEPLOYMENT.md`
- **Architecture**: `agent.md` (ดูส่วน Cloudflare Integration)
- **Cloudflare Docs**: [developers.cloudflare.com](https://developers.cloudflare.com/workers/)

---

## 🎁 Free Tier สรุป

| Service | Limit (Free) |
|---------|--------------|
| **Workers** | 100,000 requests/day |
| **D1 Database** | 5GB storage + 5M reads/day |
| **R2 Storage** | 10GB + 1M operations/month |
| **Durable Objects** | 1M requests/month |

**เพียงพอสำหรับ:** SME, Startup, MVP, Personal Projects

---

**ใช้เวลาทั้งหมด:** ~15 นาที ✨

ถ้ามีปัญหา ดูคู่มือเต็มได้ที่ `CLOUDFLARE_DEPLOYMENT.md`

