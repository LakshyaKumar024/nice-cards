# 💳 Nice Card – Internal Project Documentation

**Nice Card** is a secure, full-stack web application built using **Next.js (App Router)**, **Bun**, **Clerk authentication**, **ShadCN/UI**, **Prisma**, and **Razorpay** for payments.  
This project is **private** and proprietary — not intended for open-source distribution.

---

## 🧠 Tech Stack Overview

| Technology | Purpose |
|-------------|----------|
| **Next.js 16** | Framework for SSR/SSG |
| **Bun** | Fast runtime and package manager |
| **TypeScript** | Type safety and maintainability |
| **Clerk** | Authentication and user management |
| **Prisma** | ORM for database interactions |
| **ShadCN/UI** | Prebuilt Radix-based UI components |
| **Razorpay** | Payment gateway integration |
| **Mailtrap + Nodemailer** | Email handling and testing |
| **TailwindCSS** | Styling framework |
| **Zod + React Hook Form** | Validation and form handling |

---

## ⚙️ Environment Setup

### 1. Prerequisites

Ensure you have the following installed:
- **Bun** ≥ 1.1  
- **Node.js** ≥ 20 (for type compatibility)
- **Prisma CLI**
- **Git**

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Duplicate `.env.example` → `.env` and fill in credentials:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

DATABASE_URL=

NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_SECRET=

MAILTRAP_API_TOKEN=
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
```

All environment variables are mandatory for production.

---

## 🗃️ Database Setup (Prisma)

### 1. Generate Prisma Client
```bash
bunx prisma generate
```

### 2. Push Schema
```bash
bunx prisma db push
```

### 3. View Database (optional)
```bash
bunx prisma studio
```

---

## 🧑‍💻 Development Commands

| Command | Description |
|----------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production build |
| `bun run lint` | Run ESLint checks |

---

## 🔑 Authentication (Clerk)

Clerk is used for secure user authentication and session management.

- Initialize with your **Clerk keys** from `.env`
- Wrap your app in `<ClerkProvider />`
- Access user/session data using Clerk hooks like `useUser()` and `useAuth()`

For reference: [Clerk Docs](https://clerk.com/docs/nextjs)

---

## 💳 Payment Integration (Razorpay)

Razorpay is integrated for seamless payments.

- Add Razorpay credentials in `.env`
- Payment routes handled through Next.js API or backend
- Make sure the Razorpay SDK is initialized on the client with the publishable key

Reference: [Razorpay Node Integration Guide](https://razorpay.com/docs/payments/server-integration/nodejs/)

---

## ✉️ Email Configuration (Mailtrap + Nodemailer)

Used for transactional email testing.

Example Nodemailer setup:

```ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

---

## 🧩 UI Components (ShadCN)

UI built using [ShadCN/UI](https://ui.shadcn.com).  
To add new components:
```bash
bunx shadcn@latest add button input card
```

---

## 🧱 Project Structure

```
.
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components (ShadCN)
├── lib/                  # Utilities and helpers
├── prisma/               # Prisma schema and DB setup
├── public/               # Static assets
├── styles/               # Tailwind styles
├── .env.example          # Example env variables
├── package.json
└── README.md
```

---

## 👨‍💼 Developer Onboarding Guide

### Step 1. Clone the repository (Private Access Only)
```bash
git clone <private_repo_url>
cd nice-card
```

### Step 2. Setup Environment Variables
Create `.env` file from `.env.example` and configure with **development credentials**.

For sandbox testing:
- **Clerk**: Use your test publishable/secret keys.
- **Razorpay**: Use test mode keys from [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/).
- **Mailtrap**: Get SMTP credentials from [Mailtrap Inboxes](https://mailtrap.io/inboxes).

### Step 3. Run Development Server
```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify.

### Step 4. Testing
- Check authentication flow (Clerk sign-up & sign-in).
- Perform a dummy Razorpay test payment.
- Verify emails are being received in Mailtrap inbox.

---

## 🚀 Deployment

Recommended hosting: **Vercel**  
Other supported: **Railway**, **Render**, **Bun.sh Deploy**

**Steps:**
1. Set all environment variables in the hosting platform.  
2. Run the production build:
   ```bash
   bun run build
   bun run start
   ```

---

## 🔒 Notes

- This repository is **private** and **client-owned**.  
- Do **not** share, distribute, or publish code externally.  
- All credentials (API keys, DB URLs) are confidential and environment-specific.  
- Development environments must use **sandbox/test credentials** only.  

---

## 🧾 Project Metadata

**Project Name:** Nice Card  
**Version:** 0.1.0  
**Maintained By:** DeepVoidLab
**Client:** Confidential  

---
