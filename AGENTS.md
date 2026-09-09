# AGENTS.md

## پروژه نرم‌افزار حسابداری هوشمند

### معماری
- **monorepo** با pnpm workspaces
- **@accounting/shared**: انواع مشترک (enums, interfaces, AI types, auth types)
- **@accounting/backend**: API سرور (Node.js + Express + TypeScript + Prisma)
- **@accounting/ai-service**: میکروسرویس هوش مصنوعی (Node.js + Express)
- **@accounting/frontend**: رابط کاربری (React + TypeScript + Vite + Tailwind)

### پیش‌نیازها
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+

### دستورات کلیدی

```bash
# نصب وابستگی‌ها
pnpm install --ignore-scripts

# تنظیمات دیتابیس
cd packages/backend && npx prisma generate

# در حالت توسعه
pnpm run dev

# تک‌سرورهای
pnpm run dev:backend    # Backend API
pnpm run dev:ai        # AI Service
pnpm run dev:frontend  # Frontend

# تست و lint
cd packages/backend
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/jest

# Docker
docker-compose up -d
```

### تنظیمات محیطی (.env)
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/accounting?schema=public
JWT_SECRET=...
JWT_REFRESH_SECRET=...
AI_SERVICE_URL=http://localhost:4001
```
