# FA23-BCS-033-A
# AdFlow Pro — Sponsored Listing Marketplace

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

> Advanced Mid-Term Project — Advanced Web Technologies (CSC-337)  
> COMSATS University Islamabad | FA23-BCS-033-A | 6th Semester

---

## 🔗 Live Demo

**[https://areeba-sajjad.vercel.app/](https://areeba-sajjad.vercel.app/)**
 
 Admin | admin@adflow.com | admin123 |
 Moderator | mod@adflow.com | admin123 |

---

## 📌 Project Overview

AdFlow Pro is a production-style **moderated ads marketplace** where:

- **Clients** submit paid listings with package selection
- **Moderators** review content for quality and policy compliance
- **Admins** verify payments and control publishing
- **Only approved ads** go live for a limited package-based duration

The platform is designed as a real-world workflow system with role-based access control, scheduled automation, analytics, and external media normalization.

---

## 👥 User Roles

| Role | Responsibilities |
|------|-----------------|
| Client | Post ads, select packages, submit payment proof, track status |
| Moderator | Review submitted ads, flag violations, approve/reject content |
| Admin | Verify payments, publish/schedule ads, manage users |
| Super Admin | Full system access — packages, settings, reports |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (httpOnly cookies) |
| Deployment | Vercel |

---

## 🗂️ Project Structure

```
adflow-pro/
├── src/
│   ├── app/
│   │   ├── ads/[slug]/        # Ad detail page
│   │   ├── explore/           # Browse all ads with filters
│   │   ├── packages/          # Package comparison page
│   │   ├── categories/        # Categories listing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── dashboard/
│   │   │   ├── client/        # Client dashboard + my ads + create ad + payments
│   │   │   ├── moderator/     # Moderator review panel
│   │   │   └── admin/         # Admin dashboard + analytics + payments + users + system
│   │   ├── api/
│   │   │   ├── auth/          # register, login, logout, me
│   │   │   ├── ads/           # public ad endpoints
│   │   │   ├── packages/      # packages list
│   │   │   ├── questions/     # learning question widget
│   │   │   ├── client/        # client-only endpoints
│   │   │   ├── moderator/     # moderator-only endpoints
│   │   │   ├── admin/         # admin-only endpoints
│   │   │   ├── cron/          # scheduled job endpoints
│   │   │   └── health/        # DB heartbeat
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── ads/               # AdCard, AdCardSkeleton
│   │   └── dashboard/         # DashboardSidebar
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client (anon + admin)
│   │   └── jwt.ts             # JWT sign & verify
│   └── styles/
│       └── globals.css        # Global styles + Tailwind
├── .env.local                 # Environment variables (not committed)
├── vercel.json                # Vercel config + cron schedule
├── next.config.js
├── tailwind.config.ts
└── README.md
```

---

## 🗄️ Database Schema

13 tables covering the full workflow:

| Table | Purpose |
|-------|---------|
| `users` | Accounts with role-based access |
| `seller_profiles` | Public seller metadata |
| `packages` | Basic, Standard, Premium listing plans |
| `categories` | Ad classification taxonomy |
| `cities` | Location-based browsing |
| `ads` | Main listing records with status lifecycle |
| `ad_media` | External URL normalization (image/YouTube) |
| `payments` | Payment proof and verification records |
| `notifications` | In-app alerts per user |
| `ad_status_history` | Full workflow state tracking |
| `audit_logs` | System-wide action traceability |
| `learning_questions` | Widget + DB keep-alive content |
| `system_health_logs` | Cron job and DB monitoring |

---

## 🔄 Ad Lifecycle

```
Draft → Submitted → Under Review → Payment Pending
→ Payment Submitted → Payment Verified → Scheduled → Published → Expired
```

Each transition is logged in `ad_status_history` for full traceability.

---

## 🌐 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, categories, featured ads, packages, Q&A widget |
| `/explore` | Browse all ads with search + filters |
| `/ads/[slug]` | Full ad detail — media, seller info, package badge |
| `/packages` | Package comparison with feature table |
| `/categories` | All categories with live ad counts |
| `/login` | Login with role-based redirect |
| `/register` | Register new client account |
| `/dashboard/client` | Client dashboard — stats, recent ads, notifications |
| `/dashboard/client/my-ads` | All listings with status tracking |
| `/dashboard/client/create-ad` | 3-step ad submission form |
| `/dashboard/client/payments` | Submit payment proof + history |
| `/dashboard/moderator` | Review queue — approve/reject ads |
| `/dashboard/admin` | Admin dashboard — overview stats |
| `/dashboard/admin/payments` | Payment verification panel |
| `/dashboard/admin/analytics` | Full analytics with charts |
| `/dashboard/admin/users` | User management + RBAC |
| `/dashboard/admin/system` | System health + cron job runner |

---

## 📋 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/ads` | Public |
| GET | `/api/ads/[slug]` | Public |
| GET | `/api/packages` | Public |
| GET | `/api/questions/random` | Public |
| GET | `/api/health/db` | System |
| GET | `/api/client/ads` | Client |
| POST | `/api/client/ads` | Client |
| POST | `/api/client/payments` | Client |
| GET | `/api/client/payments` | Client |
| GET | `/api/moderator/review-queue` | Moderator |
| PATCH | `/api/moderator/ads/[id]/review` | Moderator |
| GET | `/api/admin/payment-queue` | Admin |
| PATCH | `/api/admin/payments/[id]/verify` | Admin |
| PATCH | `/api/admin/ads/[id]/publish` | Admin |
| GET | `/api/admin/analytics/summary` | Admin |
| POST | `/api/cron/publish-scheduled` | System |
| POST | `/api/cron/expire-ads` | System |

---

## 📦 Packages Available

| Package | Duration | Price | Features |
|---------|----------|-------|---------|
| Basic | 7 days | PKR 500 | Standard listing, 1x visibility |
| Standard | 15 days | PKR 1,200 | Category priority, 2x visibility |
| Premium | 30 days | PKR 2,500 | Homepage featured, 3x visibility, auto-refresh |

---

## ⏰ Scheduled Automation (Cron Jobs)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `/api/cron/publish-scheduled` | Every hour | Publishes scheduled ads when publish_at is reached |
| `/api/cron/expire-ads` | Every day | Expires ads past expire_at, sends 48hr reminders |
| `/api/health/db` | Every 30 min | DB heartbeat for Supabase keep-alive |

Configured in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "0 * * * *" },
    { "path": "/api/cron/expire-ads", "schedule": "0 0 * * *" },
    { "path": "/api/health/db", "schedule": "*/30 * * * *" }
  ]
}
```

---

## 📊 Analytics Dashboard (Admin)

- Total ads, active ads, pending reviews, expired ads
- Revenue by package — monthly trend (last 6 months)
- Moderation approval / rejection rates
- Ads by category and city (bar charts)
- Scheduled job status and DB heartbeat logs

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/AreebaSajjad/adflow-pro.git
cd adflow-pro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_random_secret_string
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@adflow.com | admin123 |
| Moderator | mod@adflow.com | admin123 |
| Client | Register on site | your choice |

---

## 🏗️ Architecture Highlights

- **RBAC** — JWT token with role check on every protected API route
- **Ad lifecycle** — 10 distinct statuses, every transition logged to `ad_status_history`
- **External media** — YouTube thumbnail auto-extraction, image URL validation, no local uploads
- **Payment flow** — duplicate `transaction_ref` blocked, admin verification required before publishing
- **Ranking formula** — `rankScore = (packageWeight × 10) + (featured ? 50 : 0) + adminBoost`
- **Traceability** — `audit_logs` + `ad_status_history` + `system_health_logs`
- **Cron jobs** — Vercel cron schedule + manual trigger from System Health page

---

## 👩‍💻 Developer

**Areeba Sajjad**  
BS Computer Science — 6th Semester  
COMSATS University Islamabad  
Roll No: FA23-BCS-033-A  
Course: Advanced Web Technologies (CSC-337)

---

## 📄 License

This project is submitted as an academic mid-term project for educational purposes.