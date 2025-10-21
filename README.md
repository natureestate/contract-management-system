# 📋 Contract Management System (POS Pro)

ระบบจัดการสัญญาว่าจ้างสำหรับงานออกแบบและก่อสร้าง พร้อม **Cloudflare Workers deployment** 

> 🎯 **พร้อมใช้งานบน Cloudflare Free Tier** - ประหยัดค่า hosting ไม่ต้องจ่ายเงิน!

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

### ☁️ Deploy to Cloudflare (Free!)

```bash
# Login to Cloudflare
npm run cf:login

# Create D1 database
npm run cf:d1:create
# แก้ไข wrangler.toml ใส่ database_id

# Apply database schema
npm run cf:d1:execute

# Create R2 bucket
npm run cf:r2:create

# Deploy!
npm run cf:deploy
```

**📖 เอกสารเพิ่มเติม:**
- 🚀 Quick Start (15 นาที): `QUICKSTART_CLOUDFLARE.md`
- 📚 คู่มือเต็ม: `CLOUDFLARE_DEPLOYMENT.md`
- ☁️ Overview: `CLOUDFLARE_README.md`

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance  
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## ✨ Features

- ✅ จัดการข้อมูลลูกค้า (บุคคล/นิติบุคคล)
- ✅ สร้างและจัดการสัญญาว่าจ้าง
- ✅ ค้นหาและ filter สัญญา
- ✅ Export สัญญาเป็น PDF
- ✅ Real-time collaboration (WebSocket)
- ✅ Responsive design
- ☁️ **Deploy ฟรีบน Cloudflare Workers**

## 📁 Project Structure

```
pospro/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (Clients, Contracts)
│   │   ├── page.tsx              # หน้าหลัก (รายการสัญญา)
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   │   ├── client-management.tsx # จัดการลูกค้า
│   │   ├── contract-form.tsx     # ฟอร์มสัญญา
│   │   ├── contract-preview.tsx  # แสดงตัวอย่างสัญญา
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── api-client.ts         # Axios instance
│   │   ├── socket.ts             # WebSocket client
│   │   ├── d1-client.ts          # Cloudflare D1 client
│   │   └── r2-storage.ts         # Cloudflare R2 storage
│   ├── types/
│   │   └── cloudflare.ts         # Cloudflare types
│   ├── durable-objects/
│   │   └── websocket.ts          # WebSocket Durable Object
│   └── worker.ts                 # Cloudflare Worker entry
├── prisma/
│   └── schema.prisma             # Database schema
├── wrangler.toml                 # Cloudflare config
├── schema.sql                    # D1 database schema
└── CLOUDFLARE_DEPLOYMENT.md      # Deployment guide
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀
