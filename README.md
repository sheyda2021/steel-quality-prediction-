# Smart Accounting - نرم‌افزار حسابداری هوشمند

نرم‌افزار حسابداری کامل با هوش مصنوعی، معماری multi-tenant و قابلیت فروش به کارفرما.

## ویژگی‌ها

- **حسابداری استاندارد**: نمودار حساب‌ها، اسناد حسابداری، حساب دریافت/پرداخت، فاکتور، صورتحساب، بانک
- **گزارشات مالی**: تراز نامه، صورت سود و ضرر، تریال بالانس
- **هوش مصنوعی**: دسته‌بندی هوشمند تراکنش‌ها، پیش‌بینی نقدینگی، تشخیص ناهنجاری، بهینه‌سازی مالیات
- **multi-tenant**: هر شرکت فضای جداگانه دارد
- **SaaS آماده**: معماری قابل استقرار و فروش به کارفرما
- **Docker**: بسته‌بندی کامل با docker-compose

## معماری

```
packages/
├── shared/       # انواع مشترک بین تمام سرویس‌ها
├── backend/      # API سرور (Node.js + Express + TypeScript + Prisma)
├── ai-service/   # میکروسرویس هوش مصنوعی
└── frontend/     # رابط کاربری (React + TypeScript + Tailwind CSS)
```

## شروع به کار

```bash
# نصب وابستگی‌ها
npm install

# راه‌اندازی دیتابیس
docker-compose up -d db

# اعمال مهاجرت دیتابیس
cd packages/backend && npx prisma db push

# راه‌اندازی توسعه
npm run dev

# یا با Docker
docker-compose up -d
```

## API Endpoints

### احراز هویت
- `POST /api/v1/auth/register` - ثبت نام شرکت و ادمین
- `POST /api/v1/auth/login` - ورود
- `POST /api/v1/auth/refresh-token` - تازه‌سازی توکن

### حسابداری
- `GET/POST/PUT/DELETE /api/v1/accounts` - نمودار حساب‌ها
- `GET/POST /api/v1/journals` - اسناد حسابداری
- `GET/POST/PUT/DELETE /api/v1/customers` - مشتریان
- `GET/POST/PUT/DELETE /api/v1/suppliers` - تامین‌کنندگان
- `GET/POST/PUT /api/v1/invoices` - فاکتورها
- `GET/POST/PUT /api/v1/bills` - صورتحساب‌ها
- `GET/POST /api/v1/bank/accounts` - حساب‌های بانکی

### گزارشات
- `GET /api/v1/reports/BALANCE_SHEET` - تراز نامه
- `GET /api/v1/reports/INCOME_STATEMENT` - صورت سود و ضرر
- `GET /api/v1/reports/TRIAL_BALANCE` - تریال بالانس

### هوش مصنوعی
- `POST /api/v1/ai/categorize` - دسته‌بندی هوشمند
- `GET /api/v1/ai/forecast` - پیش‌بینی نقدینگی
- `GET /api/v1/ai/anomalies` - تشخیص ناهنجاری
- `GET /api/v1/ai/tax-optimization` - بهینه‌سازی مالیات
- `GET /api/v1/ai/suggestions` - پیشنهادات AI
- `POST /api/v1/ai/suggestions/:id/apply` - اعمال پیشنهاد

## تست

```bash
npm run test
npm run test:coverage
```

## لایسنس

MIT
