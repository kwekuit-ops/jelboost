# SocialBoost GH — Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Local Development Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd jelboost
npm install --legacy-peer-deps
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```
Fill in all values in `.env.local`.

### 3. Database Setup
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Seed initial data (admin user, services, coupon)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

**Default Admin Credentials:**
- Email: `admin@socialboostgh.com`
- Password: `Admin@123456`

**Default Coupon:** `WELCOME20` (20% off first order)

---

## Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourname/socialboostgh
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set Framework Preset: **Next.js**
4. Add all environment variables from `.env.example`

### 3. Database (Neon PostgreSQL — Free)
1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string
3. Set `DATABASE_URL` in Vercel environment variables

### 4. Run Migrations on Production
```bash
# In Vercel, add a build command:
npx prisma generate && npx prisma migrate deploy && npm run build

# Or use the Vercel CLI:
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Payment Gateway Setup

### Paystack (Ghana Cards & Mobile Money)
1. Register at [paystack.com](https://paystack.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Set webhook URL: `https://yourdomain.com/api/wallet/webhook/paystack`

### Flutterwave (MTN, Telecel, AirtelTigo MoMo)
1. Register at [flutterwave.com](https://flutterwave.com)
2. Get keys from Dashboard → Settings → API
3. Set webhook: `https://yourdomain.com/api/wallet/webhook/flutterwave`

### Stripe (International Cards)
1. Register at [stripe.com](https://stripe.com)
2. Get keys from Dashboard → Developers → API Keys
3. Set webhook: `https://yourdomain.com/api/wallet/webhook/stripe`

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth2 credentials
4. Set Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

---

## SMM API Provider Integration
1. Go to Admin Panel → API Providers
2. Click "Add Provider"
3. Enter provider URL (e.g., `https://justanotherpanel.com/api/v2`)
4. Enter your API key
5. Click "Sync Services" to import available services

Popular SMM providers:
- [JustAnotherPanel](https://justanotherpanel.com)
- [Peakerr](https://peakerr.com)
- [SMMKings](https://smmkings.com)

---

## File Structure

```
jelboost/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── (public)/      # Public pages (home, services, contact)
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (dashboard)/   # User dashboard
│   │   ├── (admin)/       # Admin panel
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Navbar, Footer
│   │   └── providers/     # Context providers
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   ├── types/             # TypeScript type declarations
│   └── middleware.ts      # Route protection
├── public/                # Static assets
├── tailwind.config.ts     # Design system
└── .env.example           # Environment template
```

---

## Customization

### Adding New Services
Edit `prisma/seed.ts` and add entries to the `SERVICES` array, then re-run the seed.

### Changing Colors/Theme
Edit `tailwind.config.ts` → `theme.extend.colors.brand` to change the primary brand color.

### Adding Languages
Install `next-i18next` and add translation files in `public/locales/`.

---

## Support
- Email: support@socialboostgh.com
- WhatsApp: +233 XX XXX XXXX
