# ☁️ Cloudflare Integration

โปรเจกต์นี้รองรับ deployment ไปยัง **Cloudflare Workers** โดยใช้ Free Tier สามารถรองรับ SME และ Startup ได้อย่างเพียงพอ

---

## 🎯 สิ่งที่ได้จาก Cloudflare

### ✅ ประหยัดค่าใช้จ่าย
- **$0/เดือน** สำหรับ traffic ปกติ (ไม่เกิน 100K requests/วัน)
- ไม่ต้องจ่ายค่า server, database hosting
- ไม่ต้องใส่บัตรเครดิต (free tier)

### ⚡ Performance สูง
- **Edge Network**: Deploy ทั่วโลก 300+ เมือง
- **Low Latency**: Response time < 50ms
- **Auto Scaling**: รองรับ traffic spike อัตโนมัติ

### 🛡️ Security & Reliability
- **DDoS Protection** ฟรี
- **SSL/TLS** ฟรี
- **99.99% Uptime SLA**
- **Automatic Failover**

---

## 📦 Services ที่ใช้

| Service | ใช้สำหรับ | Free Tier Limit |
|---------|----------|----------------|
| **Workers** | API endpoints, Business logic | 100K requests/day |
| **D1 Database** | SQLite database | 5GB + 5M reads/day |
| **R2 Storage** | PDF files, Images | 10GB + 1M ops/month |
| **Durable Objects** | WebSocket real-time | 1M requests/month |

---

## 🚀 Quick Start

### 1. ติดตั้งและ Login
```bash
npm install
npm run cf:login
```

### 2. สร้าง Resources
```bash
# D1 Database
npm run cf:d1:create
# แก้ไข wrangler.toml ใส่ database_id
npm run cf:d1:execute

# R2 Bucket
npm run cf:r2:create
```

### 3. Deploy
```bash
npm run cf:deploy
```

**เสร็จแล้ว!** URL: `https://pospro-contract.YOUR-NAME.workers.dev`

📖 **คู่มือเต็ม:** `CLOUDFLARE_DEPLOYMENT.md`  
⚡ **Quick Start:** `QUICKSTART_CLOUDFLARE.md`

---

## 🏗️ Architecture

### Before (Traditional Hosting)
```
Next.js Server (Node.js)
├── Custom HTTP Server
├── Socket.IO Server
├── SQLite Database (Local File)
└── PDF Files (Local Storage)

💰 Cost: $10-50/month
⚠️ Single Server Location
⚠️ Manual Scaling
```

### After (Cloudflare Workers)
```
Cloudflare Edge Network (300+ Locations)
├── Workers (API + Logic)
├── Durable Objects (WebSocket)
├── D1 Database (Distributed SQLite)
└── R2 Storage (Object Storage)

💰 Cost: $0/month (Free Tier)
✅ Global Distribution
✅ Auto Scaling
✅ Built-in DDoS Protection
```

---

## 📊 Free Tier Capacity

### เหมาะสำหรับ:
- ✅ SME (< 100 users/day)
- ✅ Startup MVP
- ✅ Internal Tools
- ✅ Personal Projects

### ตัวอย่าง Usage:
```
100,000 requests/day = ~3M requests/month
= 3,000 users ที่เข้ามา 1,000 requests ต่อคน

D1: 5M reads/day = 150M reads/month
= เพียงพอสำหรับ dashboard ที่ query บ่อย

R2: 10GB storage
= ~10,000 PDF contracts (1MB/file)
```

---

## 🛠️ Development Workflow

### Local Development
```bash
# ใช้ Custom Server (เดิม)
npm run dev
# → http://localhost:3000

# หรือใช้ Wrangler (Cloudflare)
npm run cf:dev
# → http://localhost:8787
```

### Database
```bash
# Local: SQLite
DATABASE_URL="file:./db/custom.db"

# Production: Cloudflare D1
# → ใช้ D1 binding อัตโนมัติ
```

### Testing
```bash
# Test API
curl http://localhost:8787/api/health

# Test Database
npx wrangler d1 execute contract-db --command "SELECT COUNT(*) FROM Contract"

# View Logs
npm run cf:tail
```

---

## 📁 ไฟล์สำคัญ

```
pospro/
├── wrangler.toml                    # Cloudflare config
├── .dev.vars                        # Local env vars
├── schema.sql                       # D1 schema
├── CLOUDFLARE_DEPLOYMENT.md         # Full guide
├── QUICKSTART_CLOUDFLARE.md         # Quick start
├── src/
│   ├── worker.ts                    # Worker entry
│   ├── types/cloudflare.ts          # Types
│   ├── lib/
│   │   ├── d1-client.ts            # D1 client
│   │   ├── r2-storage.ts           # R2 client
│   │   └── socket.ts               # WebSocket
│   └── durable-objects/
│       └── websocket.ts            # Durable Object
```

---

## 🔄 Migration Status

| Component | Status | Details |
|-----------|--------|---------|
| **API Routes** | ✅ Ready | `src/worker.ts` |
| **Database** | ✅ Ready | D1Client wrapper |
| **WebSocket** | ✅ Ready | Durable Objects |
| **File Storage** | ✅ Ready | R2 Storage |
| **Next.js Pages** | ⚠️ Manual | ต้อง build + upload |

---

## 📈 Monitoring & Debugging

### Cloudflare Dashboard
1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → เลือก `pospro-contract`
3. ดู:
   - **Analytics**: Requests, Errors, Latency
   - **Logs**: Real-time logs
   - **Metrics**: CPU time, Success rate

### Command Line
```bash
# Real-time logs
npm run cf:tail

# Database query
npx wrangler d1 execute contract-db --command "SELECT * FROM Contract LIMIT 10"

# List R2 files
npx wrangler r2 object list contract-files

# Check account
npx wrangler whoami
```

---

## 💡 Best Practices

### 1. Database
```typescript
// ✅ Good: Use indexes
await db.prepare('SELECT * FROM Contract WHERE clientId = ?').bind(id).all();

// ❌ Bad: Full table scan
await db.prepare('SELECT * FROM Contract WHERE buildingType LIKE ?').bind('%house%').all();
```

### 2. R2 Storage
```typescript
// ✅ Good: Structured keys
await r2.put('contracts/2025/01/CONTRACT-001.pdf', data);

// ❌ Bad: Flat structure
await r2.put('CONTRACT-001.pdf', data);
```

### 3. WebSocket
```typescript
// ✅ Good: Handle reconnection
ws.on('close', () => {
  setTimeout(() => ws.connect(), 1000);
});

// ❌ Bad: No error handling
ws.connect();
```

---

## 🚨 Limits & Considerations

### CPU Time
- **Free: 10ms/request**
- Heavy computation ต้องระวัง
- ใช้ async operations

### D1 Database
- **SQLite-compatible** (ไม่ใช่ full PostgreSQL)
- ไม่รองรับ: Stored Procedures, Triggers
- จำกัด: 1MB per row

### Durable Objects
- **Stateful** - ระวังการใช้ memory
- Hibernate หลัง idle 10 seconds
- Max 1GB RAM per instance

---

## 🔐 Security Checklist

- [ ] เปลี่ยน CORS จาก `*` เป็น specific domain
- [ ] เพิ่ม rate limiting
- [ ] Validate input ทุก endpoint
- [ ] ใช้ environment variables สำหรับ secrets
- [ ] Enable Cloudflare WAF (Web Application Firewall)

---

## 📚 เอกสารเพิ่มเติม

### Cloudflare Docs
- [Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

### Project Docs
- `CLOUDFLARE_DEPLOYMENT.md` - คู่มือ deployment เต็ม
- `QUICKSTART_CLOUDFLARE.md` - Quick start 15 นาที
- `agent.md` - Architecture overview
- `examples/websocket-cloudflare-example.tsx` - WebSocket demo

---

## 🆘 Support

### ปัญหาที่พบบ่อย
1. **Database not found** → ตรวจสอบ `database_id` ใน `wrangler.toml`
2. **Deploy failed** → รัน `npm run cf:tail` เพื่อดู logs
3. **WebSocket ไม่เชื่อมต่อ** → ตรวจสอบ URL (`wss://` สำหรับ production)

### ช่องทางติดต่อ
- 📖 อ่านคู่มือ: `CLOUDFLARE_DEPLOYMENT.md`
- 🐛 Report bugs: GitHub Issues
- 💬 Community: Cloudflare Discord

---

**Last Updated:** 2025-10-20  
**Status:** ✅ Production Ready  
**Cost:** 💰 Free (within limits)

