# FA23-BCS-033-A
# AdFlow Pro — Sponsored Listing Marketplace

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

> Advanced Mid-Term Project — Advanced Web Technologies (CSC-337)  
> COMSATS University Islamabad | FA23-BCS-033-A | 6th Semester

---

## 🔗 Live Demo

**[https://adflow-pro-fa23-bcs-033-a.vercel.app](https://adflow-pro-fa23-bcs-033-a.vercel.app)**

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
| Validation | Zod |
| Deployment | Vercel |

---

## 🗂️ Project Structure
```
adflow-pro/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing, explore, ad detail pages
│   │   ├── (dashboard)/
│   │   │   ├── client/        # Client dashboard
│   │   │   ├── moderator/     # Moderator review panel
│   │   │   └── admin/         # Admin control panel
│   │   ├── api/
│   │   │   ├── auth/          # register, login, logout, me
│   │   │   ├── ads/           # public ad endpoints
│   │   │   ├── client/        # client-only endpoints
│   │   │   ├── moderator/     # moderator-only endpoints
│   │   │   ├── admin/         # admin-only endpoints
│   │   │   ├── cron/          # scheduled job endpoints
│   │   │   └── health/        # DB heartbeat
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx           # Landing page
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client (anon + admin)
│   │   └── jwt.ts             # JWT sign & verify
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   └── middleware.ts          # Route protection middleware
├── .env.local                 # Environment variables (not committed)
├── next.config.js
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

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/AreebaSajjad/adflow-pro-FA23-BCS-033-A.git
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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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

## 📦 Packages Available

| Package | Duration | Price | Features |
|---------|----------|-------|---------|
| Basic | 7 days | PKR 500 | Standard listing, 1x visibility |
| Standard | 15 days | PKR 1,200 | Category priority, 2x visibility |
| Premium | 30 days | PKR 2,500 | Homepage featured, 3x visibility, auto-refresh |

---

## 📊 Analytics Dashboard (Admin)

- Total ads, active ads, pending reviews
- Revenue by package
- Moderation approval/rejection rates
- Ads by category and city
- Scheduled job status and DB heartbeat

---

## ⏰ Scheduled Automation (Cron Jobs)

- `/api/cron/publish-scheduled` — publishes scheduled ads every hour
- `/api/cron/expire-ads` — expires outdated ads daily
- `/api/health/db` — DB heartbeat for Supabase keep-alive

---

## 📋 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/ads` | Public |
| GET | `/api/ads/:slug` | Public |
| POST | `/api/client/ads` | Client |
| POST | `/api/client/payments` | Client |
| GET | `/api/moderator/review-queue` | Moderator |
| PATCH | `/api/moderator/ads/:id/review` | Moderator |
| GET | `/api/admin/payment-queue` | Admin |
| PATCH | `/api/admin/payments/:id/verify` | Admin |
| PATCH | `/api/admin/ads/:id/publish` | Admin |
| GET | `/api/admin/analytics/summary` | Admin |
| GET | `/api/health/db` | System |

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
