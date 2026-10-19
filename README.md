# 💳 Nice Card – Editor & E-commerce Platform

**Nice Card** is a secure, full-stack web application for creating, editing, and selling customizable PDF invitation templates. Built using **Next.js (App Router)**, **Bun**, **Clerk authentication**, **ShadCN/UI**, **Prisma**, and **Razorpay** for payments.  
This project is **private** and proprietary — not intended for open-source distribution.

---

## ✨ Key Features

- 🎨 **PDF Editor**: Interactive PDF editing with text overlays, shapes, and custom fonts
- 🌐 **Multi-language Support**: Hindi fonts (Unicode & legacy) with proper rendering
- 🛒 **E-commerce**: Template marketplace with payment integration
- 👤 **User Management**: Secure authentication and user profiles
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 💾 **Template Management**: Create, edit, and manage PDF templates
- 🎯 **Admin Dashboard**: Template approval and management system

---

## 🧠 Tech Stack Overview

| Technology                | Purpose                            |
| ------------------------- | ---------------------------------- |
| **Next.js 15**            | Framework for SSR/SSG              |
| **Bun**                   | Fast runtime and package manager   |
| **TypeScript**            | Type safety and maintainability    |
| **Clerk**                 | Authentication and user management |
| **Prisma**                | ORM for database interactions      |
| **ShadCN/UI**             | Prebuilt Radix-based UI components |
| **Razorpay**              | Payment gateway integration        |
| **pdf-lib**               | PDF manipulation and editing       |
| **pdfjs-dist**            | PDF rendering in browser           |
| **fontkit**               | Custom font embedding in PDFs      |
| **Mailtrap + Nodemailer** | Email handling and testing         |
| **TailwindCSS**           | Styling framework                  |
| **Zod + React Hook Form** | Validation and form handling       |

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

| Command         | Description              |
| --------------- | ------------------------ |
| `bun run dev`   | Start development server |
| `bun run build` | Build for production     |
| `bun run start` | Start production build   |
| `bun run lint`  | Run ESLint checks        |

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

## 🎨 PDF Editor Features

### Text Editing

- Add text overlays with custom positioning
- Font customization (family, size, color, bold, italic)
- Support for Hindi fonts (Unicode and legacy)
- Drag-and-drop text positioning
- Layer management with z-index control

### Shape Tools

- Add rectangular shapes
- Resize and reposition shapes
- Color customization
- Layer ordering

### Font Support

- Standard fonts: Arial, Helvetica, Times New Roman, etc.
- Hindi fonts: Noto Sans Devanagari (Unicode), AMS Aasmi, Kruti Dev 640
- Custom font embedding in exported PDFs

### Export

- Export edited PDFs with all overlays
- Proper font embedding for Hindi text
- Unicode normalization for copy-pasted text

---

## 📝 Custom Fonts

The application supports custom fonts for multi-language support. See [CUSTOM_FONTS_GUIDE.md](./CUSTOM_FONTS_GUIDE.md) for detailed instructions on adding new fonts.

**Current Fonts:**

- **Noto Sans Devanagari**: Unicode Hindi font (recommended for copy-paste)
- **AMS Aasmi**: Legacy Hindi font (typing only)
- **Kruti Dev 640**: Legacy Devanagari font (typing only)

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
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── dashboard/            # User dashboard
│   ├── edit/                 # PDF editor
│   ├── design/               # Template browsing
│   └── my-template/          # User templates
├── components/               # Reusable UI components
│   ├── admin/                # Admin components
│   ├── checkout/             # Payment components
│   ├── ui/                   # ShadCN components
│   ├── pdf-editor.tsx        # Main PDF editor
│   ├── pdf-canvas.tsx        # PDF rendering canvas
│   ├── layers-panel.tsx      # Layer management
│   └── formatting-toolbar.tsx # Text formatting
├── lib/                      # Utilities and helpers
│   ├── custom-fonts.ts       # Font management
│   ├── export-utils.ts       # PDF export logic
│   ├── pdf-utils.ts          # PDF processing
│   └── types.ts              # TypeScript types
├── prisma/                   # Prisma schema and DB setup
├── public/                   # Static assets
│   └── fonts/                # Custom font files
├── private/                  # Private files (PDFs, images)
├── CUSTOM_FONTS_GUIDE.md     # Font setup guide
├── HINDI_FONT_SETUP.md       # Hindi font instructions
├── .env.example              # Example env variables
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

### Step 3. Setup Database

```bash
bunx prisma generate
bunx prisma db push
```

### Step 4. Setup Custom Fonts (Optional)

For Hindi text support, download and add fonts to `public/fonts/`:

- Noto Sans Devanagari (recommended for Unicode Hindi)
- See [CUSTOM_FONTS_GUIDE.md](./CUSTOM_FONTS_GUIDE.md) for details

### Step 5. Run Development Server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify.

### Step 6. Testing

- Check authentication flow (Clerk sign-up & sign-in).
- Test PDF editor functionality (add text, shapes, export).
- Test Hindi font rendering (type and paste).
- Perform a dummy Razorpay test payment.
- Verify emails are being received in Mailtrap inbox.

---

## 🚀 Deployment

Recommended hosting: **VPS**  
Other supported: **Vercel**, **Desigital Ocean**, **AWS**

**Steps:**

1. Set all environment variables in the hosting platform.
2. Run the production build:
   ```bash
   bun run build
   bun run start
   ```

---

## � Troubleshooting

### Authentication Issues

If users cannot log in, sign up, or access protected routes:

- Confirm your Clerk keys in .env are correct

- Check network logs for failed Clerk API requests

- Restart the development server after updating environment variables

- Most importantly:

  - → Clerk may be experiencing an outage
    Check live status: https://status.clerk.com

If the status page shows an incident, wait until Clerk resolves it. No action is needed on your side.

### PDF Editor Issues

**Text shows as boxes in exported PDF:**

- Ensure you're using a Unicode font (Noto Sans Devanagari) for Hindi text
- Legacy fonts (AMS Aasmi, Kruti Dev) only work with keyboard typing, not copy-paste
- See [HINDI_FONT_SETUP.md](./HINDI_FONT_SETUP.md) for details

**Fonts not appearing in dropdown:**

- Check that font is added to `components/formatting-toolbar.tsx`
- Verify font file exists in `public/fonts/`
- Restart dev server after adding fonts

**PDF export fails:**

- Check browser console for errors
- Verify font files are accessible
- Ensure pdf-lib and fontkit are properly installed

### Database Issues

**Prisma errors:**

```bash
bunx prisma generate
bunx prisma db push
```

**Connection issues:**

- Verify DATABASE_URL in `.env`
- Check database server is running

---

## 📚 Additional Documentation

- [CUSTOM_FONTS_GUIDE.md](./CUSTOM_FONTS_GUIDE.md) - How to add custom fonts
- [HINDI_FONT_SETUP.md](./HINDI_FONT_SETUP.md) - Hindi font setup instructions

---

## 🔒 Notes

- This repository is **private** and **client-owned**.
- Do **not** share, distribute, or publish code externally.
- All credentials (API keys, DB URLs) are confidential and environment-specific.
- Development environments must use **sandbox/test credentials** only.
- Font files must have proper licensing for commercial use.

---

## 🧾 Project Metadata

**Project Name:** Nice Card  
**Version:** 1.0.0  
**Client:** Nice-Card  
**Last Updated:** November 2025
---
