# 🤖 Agent Documentation - ระบบจัดการสัญญาว่าจ้าง (Contract Management System)

## 📋 ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็นระบบจัดการสัญญาว่าจ้างสำหรับงานออกแบบและก่อสร้าง สร้างด้วย Next.js 15, TypeScript, และ Prisma ORM พร้อมระบบ WebSocket แบบ real-time

## 🏗️ สถาปัตยกรรมระบบ

### Backend Architecture
- **Custom Server**: ใช้ `server.ts` แทน Next.js standalone server
- **HTTP Server**: Node.js `http.createServer()` พร้อม Next.js request handler
- **WebSocket**: Socket.IO server ทำงานร่วมกับ HTTP server บนพอร์ตเดียวกัน
- **Database**: SQLite ผ่าน Prisma ORM
- **API Routes**: Next.js App Router API routes (`/src/app/api/*`)

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **State Management**: React hooks + Zustand (ถ้าจำเป็น)
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Axios with custom API client
- **Real-time**: Socket.IO client

## 📂 โครงสร้างโปรเจกต์

```
pospro/
├── server.ts                    # Custom server with Socket.IO
├── prisma/
│   └── schema.prisma           # Database schema (User, Client, Contract)
├── db/
│   └── custom.db               # SQLite database file
├── src/
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   │   ├── clients/        # จัดการลูกค้า (CRUD)
│   │   │   │   ├── route.ts    # GET, POST /api/clients
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PUT, DELETE /api/clients/:id
│   │   │   ├── contracts/      # จัดการสัญญา (CRUD)
│   │   │   │   ├── route.ts    # GET, POST /api/contracts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts     # GET, PUT, DELETE /api/contracts/:id
│   │   │   │       └── pdf/
│   │   │   │           └── route.ts # GET /api/contracts/:id/pdf
│   │   │   └── health/
│   │   │       └── route.ts    # Health check endpoint
│   │   ├── layout.tsx          # Root layout with suppressHydrationWarning
│   │   ├── page.tsx            # หน้าแรก - แสดงรายการสัญญา
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── client-management.tsx   # Component จัดการลูกค้า
│   │   ├── contract-form.tsx       # Form สร้าง/แก้ไขสัญญา
│   │   ├── contract-preview.tsx    # Preview สัญญาแบบ Modal
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts              # Prisma client instance
│   │   ├── api-client.ts      # Axios instance สำหรับ API calls
│   │   ├── socket.ts          # Socket.IO setup
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Models

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Client (ผู้ว่าจ้าง)
```prisma
model Client {
  id              String   @id @default(cuid())
  name            String
  type            String   // "individual" หรือ "company"
  idCard          String?  // เลขบัตรประชาชน
  registrationNo  String?  // เลขทะเบียนบริษัท
  address         String
  phone           String?
  email           String?
  taxId           String?  // เลขประจำตัวผู้เสียภาษี
  contactPerson   String?  // ผู้ติดต่อ (สำหรับบริษัท)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  contracts       Contract[]
}
```

#### Contract (สัญญาว่าจ้าง)
```prisma
model Contract {
  id                    String   @id @default(cuid())
  contractNumber        String   // สัญญาเลขที่
  location              String   // ทำที่
  contractDate          DateTime // วันที่ทำสัญญา
  
  // ข้อมูลผู้ว่าจ้าง
  clientId              String
  client                Client   @relation(fields: [clientId], references: [id])
  
  // ข้อมูลผู้รับจ้าง
  contractorName        String
  contractorType        String   // "individual" หรือ "company"
  contractorIdCard      String?
  contractorRegistration String?
  contractorAddress     String
  contractorPosition    String?
  
  // รายละเอียดโครงการ
  buildingType          String   // ประเภทอาคาร
  buildingFloors        String   // จำนวนชั้น
  buildingArea          String   // พื้นที่ใช้สอย
  projectLocation       String   // ที่ตั้งโครงการ
  
  // ระยะเวลาดำเนินการ (วัน)
  floorPlanDuration     Int      @default(10)
  threeDDuration        Int      @default(15)
  constructionDuration  Int      @default(20)
  
  // ค่าตอบแทน
  totalFee              Float
  paymentTerms          String
  
  // พยาน
  witness1Name          String?
  witness1Signature     String?
  witness2Name          String?
  witness2Signature     String?
  
  // ลายเซ็น
  clientSignature       String?
  contractorSignature   String?
  clientSignDate        DateTime?
  contractorSignDate    DateTime?
  
  status                String   @default("draft") // draft, signed, completed, cancelled
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## 🔧 การตั้งค่าและใช้งาน

### Environment Variables (.env)
```env
DATABASE_URL="file:./db/custom.db"
```

### คำสั่งที่สำคัญ

```bash
# Development
npm run dev                # รัน dev server (custom server + Socket.IO)

# Production
npm run build             # Build Next.js
npm start                 # รัน production server

# Database
npm run db:push          # Push Prisma schema ไปยัง database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # รัน migrations
npm run db:reset         # Reset database
npx prisma studio        # เปิด Prisma Studio (GUI) ที่ localhost:5555

# Code Quality
npm run lint             # รัน ESLint
```

### Server Configuration (server.ts)

```typescript
const currentPort = 3000;
const hostname = 'localhost';

// Server URLs:
// - Web: http://localhost:3000
// - Socket.IO: ws://localhost:3000/api/socketio
```

## 🌐 API Endpoints

### Clients API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | ดึงรายการลูกค้าทั้งหมด |
| POST | `/api/clients` | สร้างลูกค้าใหม่ |
| GET | `/api/clients/:id` | ดึงข้อมูลลูกค้า 1 รายการ |
| PUT | `/api/clients/:id` | แก้ไขข้อมูลลูกค้า |
| DELETE | `/api/clients/:id` | ลบลูกค้า |

### Contracts API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracts` | ดึงรายการสัญญาทั้งหมด (พร้อม client relation) |
| POST | `/api/contracts` | สร้างสัญญาใหม่ |
| GET | `/api/contracts/:id` | ดึงข้อมูลสัญญา 1 รายการ |
| PUT | `/api/contracts/:id` | แก้ไขข้อมูลสัญญา |
| DELETE | `/api/contracts/:id` | ลบสัญญา |
| GET | `/api/contracts/:id/pdf` | ดาวน์โหลดสัญญาเป็น PDF |

### Health Check API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | ตรวจสอบสถานะของ server |

## 🎨 UI Components

### หน้าหลัก (page.tsx)
- แสดงรายการสัญญาทั้งหมดในรูปแบบตาราง
- ค้นหาสัญญาด้วย contract number, client name, contractor name, building type
- Filter และแสดงสถานะสัญญา (draft, signed, completed, cancelled)
- Actions: ดูรายละเอียด, ดาวน์โหลด PDF, แก้ไข

### Client Management (client-management.tsx)
- CRUD operations สำหรับจัดการลูกค้า
- รองรับทั้งบุคคลธรรมดาและนิติบุคคล

### Contract Form (contract-form.tsx)
- Form สร้าง/แก้ไขสัญญาว่าจ้าง
- React Hook Form + Zod validation
- รองรับการเลือกลูกค้าจาก dropdown
- คำนวณค่าตอบแทนและระยะเวลาต่างๆ

### Contract Preview (contract-preview.tsx)
- แสดงรายละเอียดสัญญาแบบ Modal
- Preview ก่อนพิมพ์หรือดาวน์โหลด PDF

## 🔌 WebSocket (Socket.IO)

### Server Setup
```typescript
// src/lib/socket.ts
export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Handle events here
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}
```

### Client Usage
```typescript
// src/lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io({
  path: '/api/socketio',
  autoConnect: false
});
```

## 🎯 สถานะโปรเจกต์

### ✅ ทำเสร็จแล้ว
- [x] Custom server with Socket.IO integration
- [x] Prisma ORM setup with SQLite
- [x] Database models (User, Client, Contract)
- [x] API endpoints for Clients and Contracts
- [x] Client management UI
- [x] Contract management UI with search and filter
- [x] Contract form with validation
- [x] Contract preview modal
- [x] Hydration error fix (suppressHydrationWarning)
- [x] Environment configuration (.env)

### 🚧 ต้องพัฒนาต่อ
- [ ] PDF generation for contracts
- [ ] Contract signing functionality
- [ ] Real-time collaboration with Socket.IO
- [ ] User authentication (NextAuth.js)
- [ ] File upload for attachments
- [ ] Dashboard and analytics
- [ ] Email notifications
- [ ] Print templates

## 🐛 ปัญหาที่เจอและวิธีแก้

### 1. AxiosError 500 - Database Connection
**ปัญหา**: Prisma Client ไม่พบ DATABASE_URL environment variable

**วิธีแก้**:
```bash
# 1. สร้าง .env file
echo 'DATABASE_URL="file:./db/custom.db"' > .env

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema
npx prisma db push

# 4. รีสตาร์ทเซิร์ฟเวอร์
npm run dev
```

### 2. Hydration Error
**ปัญหา**: Browser extensions (Bitwarden, password managers) แทรก attributes เข้าไปใน HTML ทำให้เกิด hydration mismatch

**วิธีแก้**: เพิ่ม `suppressHydrationWarning` ที่ `<body>` tag ใน `layout.tsx`

```tsx
<body suppressHydrationWarning>
  {children}
</body>
```

### 3. Port Already in Use
**วิธีแก้**:
```bash
# macOS/Linux
lsof -ti :3000 | xargs kill -9

# หรือใช้คำสั่งใน package.json
npm run dev
```

## 📝 Best Practices สำหรับ Agent

### การเขียน Code
1. **ใช้ภาษาไทยในการ comment** เพื่อความเข้าใจง่าย
2. **Type Safety**: ใช้ TypeScript อย่างเต็มรูปแบบ ไม่ใช้ `any`
3. **Error Handling**: ทุก API route ต้องมี try-catch และ return appropriate status codes
4. **Validation**: ใช้ Zod สำหรับ input validation
5. **ตรวจสอบ linter**: รัน `npm run lint` หลังแก้ไข code

### การทำงานกับ Database
1. ใช้ Prisma Client ผ่าน `@/lib/db`
2. ใช้ transactions สำหรับ operations ที่เกี่ยวข้องกันหลายตาราง
3. ใช้ `include` และ `select` เพื่อ optimize queries
4. หลังแก้ schema.prisma ต้องรัน `npx prisma generate && npx prisma db push`

### การทำงานกับ API
1. ใช้ `apiClient` จาก `@/lib/api-client.ts` สำหรับ HTTP requests
2. Handle loading states และ error states
3. ใช้ TanStack Query (React Query) สำหรับ data fetching ที่ซับซ้อน

### UI/UX Guidelines
1. ใช้ shadcn/ui components เป็นหลัก
2. ทุก action ที่สำคัญต้องมี confirmation dialog
3. แสดง loading indicators สำหรับ async operations
4. ใช้ toast notifications สำหรับ feedback
5. Responsive design - ทดสอบทุก breakpoint

## 🔐 Security Considerations

1. **Input Validation**: ตรวจสอบ input ทุกครั้งทั้ง client และ server side
2. **SQL Injection**: Prisma ป้องกันอัตโนมัติ แต่ต้องระวัง raw queries
3. **Authentication**: ยังไม่ได้ implement - ควรเพิ่ม NextAuth.js
4. **Authorization**: ควรเพิ่ม role-based access control
5. **CORS**: ตั้งค่าใน Socket.IO server (ปัจจุบันเป็น `origin: "*"` - ควรเปลี่ยนใน production)

## 🚀 Deployment Notes

### Development (Local Server)
```bash
npm run dev  # Runs on http://localhost:3000 (Custom Server + Socket.IO)
```

### Development (Cloudflare Workers)
```bash
npm run cf:dev  # Runs on http://localhost:8787 (Wrangler Dev)
```

### Production (Traditional)
```bash
npm run build  # Build Next.js
npm start      # Run production server with tsx
```

### Production (Cloudflare Workers)
```bash
npm run build      # Build Next.js
npm run cf:deploy  # Deploy to Cloudflare Workers
```

### Database
- **Local Development**: SQLite database อยู่ที่ `./db/custom.db`
- **Production (Cloudflare)**: Cloudflare D1 (SQLite-compatible)
- Backup database ก่อน deploy production
- ดูคู่มือ Cloudflare deployment ที่ `CLOUDFLARE_DEPLOYMENT.md`

## ☁️ Cloudflare Integration

โปรเจกต์นี้พร้อม deploy ไปยัง Cloudflare Workers ecosystem โดยใช้:

### Cloudflare Services
- **Workers**: รัน API endpoints และ business logic
- **D1 Database**: SQLite-compatible database (Free: 5GB, 5M reads/day, 100K writes/day)
- **R2 Storage**: Object storage สำหรับ PDF และไฟล์ (Free: 10GB, 1M ops/month)
- **Durable Objects**: WebSocket real-time communication (Free: 1M requests/month)

### ไฟล์ที่เกี่ยวข้อง
```
pospro/
├── wrangler.toml                    # Cloudflare Workers configuration
├── .dev.vars                        # Local environment variables
├── schema.sql                       # SQL schema สำหรับ D1
├── CLOUDFLARE_DEPLOYMENT.md         # คู่มือ deployment
├── src/
│   ├── worker.ts                    # Worker entry point
│   ├── types/cloudflare.ts          # Cloudflare types
│   ├── lib/
│   │   ├── d1-client.ts            # D1 database client
│   │   ├── r2-storage.ts           # R2 storage client
│   │   └── socket.ts               # WebSocket client (Native API)
│   └── durable-objects/
│       └── websocket.ts            # WebSocket Durable Object
```

### คำสั่ง Cloudflare
```bash
# Login
npm run cf:login

# สร้าง D1 Database
npm run cf:d1:create
npm run cf:schema              # Generate schema.sql
npm run cf:d1:execute          # Apply schema

# สร้าง R2 Bucket
npm run cf:r2:create

# Development
npm run cf:dev                 # Local Cloudflare Workers

# Deployment
npm run cf:deploy              # Deploy to production

# Monitoring
npm run cf:tail                # Real-time logs
```

### Migration จาก Custom Server ไป Cloudflare
1. ✅ **Database**: SQLite → Cloudflare D1
2. ✅ **WebSocket**: Socket.IO → Durable Objects
3. ✅ **File Storage**: Local → R2 Storage
4. ✅ **API Routes**: Next.js API → Workers

### Free Tier Limits
- **Workers**: 100,000 requests/day, 10ms CPU/request
- **D1**: 5GB storage, 5M reads/day, 100K writes/day
- **R2**: 10GB storage, 1M Class A ops/month, 10M Class B ops/month
- **Durable Objects**: 1M requests/month, 400K GB-s/month

สำหรับรายละเอียดเพิ่มเติม ดูที่ `CLOUDFLARE_DEPLOYMENT.md`

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing Guidelines

1. สร้าง branch ใหม่สำหรับ feature แต่ละอย่าง
2. เขียน commit messages ที่ชัดเจน (ไทยหรืออังกฤษก็ได้)
3. ทดสอบ code ก่อน commit
4. รัน `npm run lint` เพื่อตรวจสอบ code quality
5. Update `agent.md` เมื่อมีการเปลี่ยนแปลง architecture หรือ features สำคัญ

---

**Last Updated**: 2025-10-20
**Version**: 1.0.0
**Maintainer**: Development Team

