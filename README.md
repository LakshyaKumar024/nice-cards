# 💳 Nice Card – Editor & E-commerce Platform

**Nice Card** is a secure, full-stack web application for creating, editing, and selling customizable PDF invitation templates. Built using **Next.js (App Router)**, **Bun**, **Clerk authentication**, **ShadCN/UI**, **Prisma**, and **Razorpay** for payments.  
This project is **private** and proprietary — not intended for open-source distribution.

---

## ✨ Key Features

- 🎨 **PDF Editor**: Interactive PDF editing with rich text overlays (Slate.js), custom shapes, and images
- 🖼️ **Image Overlays & Manipulation**: Dedicated "Add Image" tool, drag-and-drop onto canvas or Slate, 8 visual resize handles, canvas rotation handle, and sidebar aspect-ratio lock
- 🪟 **Transparent PNG Support**: Full alpha-channel transparency preserved across preview and high-fidelity PDF print export
- 🌐 **Multi-language Support**: Hindi fonts (Unicode & legacy) with proper rendering and Unicode normalization
- 🛒 **E-commerce**: Template marketplace with Razorpay payment integration
- 👤 **User Management**: Secure authentication and user profiles via Clerk
- 📱 **Responsive Design**: Resolution-independent coordinate normalization for desktop, tablet, and mobile
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

### Text Editing (Slate.js Integration)

- Add rich text overlays with custom positioning and alignment (`left`, `center`, `right`, `justify`)
- Slate.js rich-text editing with inline formatting (bold, italic, per-selection font styling)
- Clipboard pasting (`Ctrl+V`) for plain and multiline text without shortcut collision
- Inline image pasting and drag-and-drop inside Slate textboxes
- Multi-language Hindi font support (Unicode and legacy typing)
- Drag-and-drop text positioning and z-index layer ordering

### Image Tools

- **Toolbar Button**: Dedicated "Add Image" button right next to the Shape Tool on the top toolbar
- **Drag & Drop**: Drop images directly onto the canvas to place at drop coordinates, or drop directly into active Slate textboxes
- **Supported Formats**: PNG and JPG/JPEG files supported with strict 10MB file size limits
- **Alpha Transparency**: Full transparent PNG background preservation (no black or white background artifacts)
- **Interactive Canvas Controls**:
  - 8 resize handles (`nw`, `ne`, `sw`, `se`, `n`, `s`, `e`, `w`) with stable opposite-corner anchoring
  - Circular visual rotation handle above the element with real-time drag-rotation and `Shift`-key 15° snapping
- **Sidebar Formatting Toolbar**:
  - Width and Height percentage sliders (1%–200%) and direct numeric input fields
  - Lock Aspect Ratio toggle for proportional resizing
  - Quick `-10%` and `+10%` scale buttons
  - Rotation slider (0°–360°), `-15°` / `+15°` step buttons, `+90°` flip, `180°` flip, and `Reset 0°`
- **Cloud & Offline Fallback**: Direct Cloudinary upload with instant Base64 fallback

### Shape Tools

- Add rectangular and square shapes
- 8-point interactive resize handles and canvas rotation handle
- Color customization via color picker and hex codes
- Layer ordering and visibility toggles

### Font Support

- Standard fonts: Arial, Helvetica, Times New Roman, etc.
- Hindi fonts: Noto Sans Devanagari (Unicode), AMS Aasmi, Kruti Dev 640
- Custom font embedding in exported PDFs via `fontkit`

### Export System (High-Fidelity PDF Export)

- Export edited PDFs with all overlays (text, shapes, and images) using `pdf-lib`
- **Document-Flow Layout for Slate**: Images embedded in Slate textboxes are placed in exact DOM sequence, preventing text overlap and maintaining user-specified positions
- **Device-Independent Scaling**: Automatically maps 1.5x PDF.js canvas viewport display coordinates to 72 DPI PDF point coordinates (`CANVAS_SCALE = 1.5`) across all device screen sizes
- **Aspect Ratio Fidelity**: Employs mathematical `object-fit: contain` fitting in `pdf-lib` so exported images are never stretched or squished
- **Alpha Transparency Preservation**: Natively embeds PNG alpha channels (`/SMask`) for high-quality printing without opaque bounding boxes
- Proper font embedding and Unicode normalization for Hindi text

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
**Last Updated:** November 2026
---
