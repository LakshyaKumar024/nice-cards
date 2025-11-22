# Nice Card - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [Environment Configuration](#environment-configuration)
6. [Database Schema](#database-schema)
7. [Application Structure](#application-structure)
8. [Core Features](#core-features)
9. [API Routes](#api-routes)
10. [PDF Editor System](#pdf-editor-system)
11. [Payment Integration](#payment-integration)
12. [Authentication & Authorization](#authentication--authorization)
13. [Font Management](#font-management)
14. [Deployment](#deployment)
15. [Development Workflow](#development-workflow)
16. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Nice Card** is a full-stack SaaS platform for creating, editing, and selling customizable PDF invitation templates. The platform combines e-commerce functionality with a powerful browser-based PDF editor that supports multi-language text (including Hindi), custom fonts, shapes, and advanced formatting.

### Key Capabilities
- Browse and purchase invitation templates (wedding, birthday, corporate, etc.)
- Interactive PDF editor with drag-and-drop text and shape overlays
- Multi-language support with Unicode and legacy Hindi fonts
- Secure payment processing via Razorpay
- User authentication and template management
- Admin dashboard for template approval and management
- Responsive design for desktop and mobile devices

### Project Metadata
- **Name**: Nice Card
- **Version**: 0.1.0
- **License**: Private/Proprietary
- **Runtime**: Bun ≥ 1.1
- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5.x

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │  PDF Editor  │  │   Razorpay   │      │
│  │   (React)    │  │  (pdfjs-dist)│  │   Checkout   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Pages    │  │ API Routes │  │ Middleware │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Clerk   │  │ Razorpay │  │Cloudinary│  │ Mailtrap │   │
│  │  (Auth)  │  │(Payment) │  │ (Images) │  │  (Email) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database (via Prisma)             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Templates  │  │   Orders   │  │   Saved    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Request** → Next.js App Router
2. **Authentication** → Clerk validates session
3. **Data Fetching** → Prisma queries PostgreSQL
4. **Business Logic** → API routes process requests
5. **External Services** → Razorpay, Cloudinary, Mailtrap
6. **Response** → Server-side rendered or JSON response

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router, SSR/SSG |
| **React** | 19.2.0 | UI library for component-based architecture |
| **TypeScript** | 5.x | Type-safe JavaScript with static typing |
| **TailwindCSS** | 4.x | Utility-first CSS framework |
| **ShadCN/UI** | Latest | Pre-built Radix UI components |
| **pdfjs-dist** | 3.11.174 | PDF rendering in browser |
| **pdf-lib** | 1.17.1 | PDF manipulation and editing |
| **fontkit** | 2.0.4 | Font parsing and embedding |
| **React Hook Form** | 7.66.0 | Form state management |
| **Zod** | 4.1.12 | Schema validation |
| **Lucide React** | 0.553.0 | Icon library |
| **Sonner** | 2.0.7 | Toast notifications |
| **React Colorful** | 5.6.1 | Color picker component |
| **@dnd-kit** | Latest | Drag-and-drop functionality |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Bun** | ≥ 1.1 | Fast JavaScript runtime and package manager |
| **Prisma** | 6.18.0 | ORM for database operations |
| **PostgreSQL** | Latest | Relational database |
| **Express** | 5.1.0 | File upload server |
| **Multer** | 2.0.2 | Multipart form data handling |
| **Nodemailer** | 7.0.10 | Email sending via Brevo SMTP |
| **Canvas** | 3.2.0 | Server-side canvas for PDF processing |

### Third-Party Services
| Service | Purpose |
|---------|---------|
| **Clerk** | Authentication and user management |
| **Razorpay** | Payment gateway integration |
| **Cloudinary** | Image hosting and CDN |
| **Brevo** | Email delivery service |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality |
| **Prettier** | Code formatting |
| **Docker** | Containerization |
| **Git** | Version control |

---

## Setup & Installation

### Prerequisites

Ensure the following are installed on your system:

- **Bun** ≥ 1.1 ([Installation Guide](https://bun.sh/docs/installation))
- **Node.js** ≥ 20 (for type compatibility)
- **PostgreSQL** (local or remote instance)
- **Git** for version control

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd nice-card
```

#### 2. Install Dependencies

```bash
bun install
```

This will install all dependencies listed in `package.json`.

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in all required credentials (see [Environment Configuration](#environment-configuration)).

#### 4. Setup Database

Generate Prisma client:

```bash
bunx prisma generate
```

Push schema to database:

```bash
bunx prisma db push
```

(Optional) Open Prisma Studio to view database:

```bash
bunx prisma studio
```

#### 5. Setup Custom Fonts

Ensure custom font files are present in `public/fonts/`. See [Font Management](#font-management) for details.

#### 6. Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

#### 7. Start Upload Server (Optional)

For file uploads via Express:

```bash
bun run upload-server
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_SECRET=xxxxx

# Email (Brevo)
MAILTRAP_API_TOKEN=xxxxx
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=xxxxx
SMTP_PASSWORD=xxxxx

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_EXPRESS_SERVER_URL=http://localhost:4000
```

### Environment Variable Details

#### Clerk Authentication
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Public key for client-side Clerk integration
- **CLERK_SECRET_KEY**: Secret key for server-side Clerk operations
- Get these from [Clerk Dashboard](https://dashboard.clerk.com/)

#### Database
- **DATABASE_URL**: PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database_name`
- Can use services like Neon, Supabase, or local PostgreSQL

#### Razorpay
- **NEXT_PUBLIC_RAZORPAY_KEY_ID**: Public key for checkout
- **RAZORPAY_SECRET**: Secret key for order verification
- Get from [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Use test keys for development

#### Email (Brevo)
- **MAILTRAP_API_TOKEN**: API token (legacy variable name, used for Brevo)
- **SMTP_HOST**: SMTP server hostname (smtp-relay.brevo.com)
- **SMTP_PORT**: SMTP port (587 for Brevo)
- **SMTP_USERNAME**: Brevo SMTP username (your login email)
- **SMTP_PASSWORD**: Brevo SMTP password (API key)
- Get from [Brevo SMTP Settings](https://app.brevo.com/settings/keys/smtp)

#### Application URLs
- **NEXT_PUBLIC_BASE_URL**: Base URL of the Next.js application
- **NEXT_PUBLIC_EXPRESS_SERVER_URL**: URL of the Express upload server

### Security Best Practices

1. **Never commit `.env` to version control**
2. Use different credentials for development, staging, and production
3. Rotate secrets regularly
4. Use environment-specific keys (test keys in development)
5. Store production secrets in secure vault services

---

## Database Schema

### Prisma Schema Overview

The application uses PostgreSQL with Prisma ORM. The schema is defined in `prisma/schema.prisma`.

### Models

#### Template Model

Stores invitation template information.

```prisma
model Template {
  uuid        String     @id @default(uuid())
  name        String
  description String?
  catogery    CATEGORYS? @default(OTHER)
  tags        String
  image       String
  price       Int?
  paid        Boolean    @default(false)
  svg         String?
  pdf         String
  status      Boolean?   @default(true)
  createdAt   DateTime   @default(now())

  savedTemplates SavedTemplate[]

  @@map(name: "templates")
}
```

**Fields:**
- `uuid`: Unique identifier (primary key)
- `name`: Template name
- `description`: Optional description
- `catogery`: Template category (enum)
- `tags`: Comma-separated tags
- `image`: URL to preview image
- `price`: Price in smallest currency unit (paise for INR)
- `paid`: Whether template is paid or free
- `svg`: Optional SVG file path
- `pdf`: PDF file path (required)
- `status`: Active/inactive status
- `createdAt`: Creation timestamp

#### SavedTemplate Model

Tracks user-purchased templates.

```prisma
model SavedTemplate {
  uuid          String   @id @default(uuid())
  userId        String
  templateId    String
  file_location String?
  createdAt     DateTime @default(now())

  template Template @relation(fields: [templateId], references: [uuid], onDelete: Cascade)

  @@map(name: "saved_templates")
}
```

**Fields:**
- `uuid`: Unique identifier
- `userId`: Clerk user ID
- `templateId`: Reference to Template
- `file_location`: Optional custom file location
- `createdAt`: Purchase timestamp

#### Order Model

Stores payment order information.

```prisma
model Order {
  id              Int      @id @default(autoincrement())
  userId          String
  templateId      String
  razorpayOrderId String   @unique
  amount          Int
  currency        String?  @default("INR")
  status          String?  @default("pending")
  createdAt       DateTime @default(now())
}
```

**Fields:**
- `id`: Auto-incrementing primary key
- `userId`: Clerk user ID
- `templateId`: Template being purchased
- `razorpayOrderId`: Razorpay order ID
- `amount`: Order amount
- `currency`: Currency code (default: INR)
- `status`: Order status (pending, completed, failed)
- `createdAt`: Order creation timestamp

### Enums

#### CATEGORYS Enum

```prisma
enum CATEGORYS {
  WEDDING
  BIRTHDAY
  ANNIVERSARY
  GRADUATION
  BABYSHOWER
  FESTIVAL
  INVITATION
  CORPORATE
  OTHER
}
```

### Database Commands

```bash
# Generate Prisma Client
bunx prisma generate

# Push schema changes to database
bunx prisma db push

# Create migration
bunx prisma migrate dev --name migration_name

# Open Prisma Studio
bunx prisma studio

# Reset database (WARNING: deletes all data)
bunx prisma migrate reset
```

---

## Application Structure

### Directory Structure

```
nice-card/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (policies)/               # Legal pages
│   │   ├── privacy/
│   │   └── terms/
│   ├── api/                      # API routes
│   │   ├── (getDocument)/        # Document retrieval
│   │   │   ├── getPdf/
│   │   │   └── getSvg/
│   │   ├── (payment)/            # Payment processing
│   │   │   └── order/
│   │   ├── dashboard/            # Dashboard APIs
│   │   └── design/               # Template APIs
│   ├── dashboard/                # User dashboard
│   │   └── create/               # Template creation
│   ├── design/                   # Template browsing
│   │   └── [templateId]/         # Template details & checkout
│   ├── developer/                # Developer tools
│   ├── edit/                     # PDF editor
│   │   └── [templateId]/
│   ├── my-template/              # User's templates
│   ├── search/                   # Search functionality
│   ├── favicon.ico
│   ├── fonts.css                 # Custom font declarations
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # Context providers
├── components/                   # React components
│   ├── admin/                    # Admin components
│   │   └── template-manager.tsx
│   ├── checkout/                 # Checkout components
│   │   ├── orderSummary.tsx
│   │   └── templateCard.tsx
│   ├── ui/                       # ShadCN UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── footer.tsx
│   ├── formatting-toolbar.tsx    # PDF editor toolbar
│   ├── layers-panel.tsx          # Layer management
│   ├── navbar.tsx
│   ├── pdf-canvas.tsx            # PDF rendering canvas
│   ├── pdf-editor.tsx            # Main PDF editor
│   ├── svg-viewer.tsx
│   └── template-card.tsx
├── lib/                          # Utility libraries
│   ├── cloudinary.ts             # Cloudinary integration
│   ├── color-utils.ts            # Color manipulation
│   ├── custom-fonts.ts           # Font management
│   ├── db-init.ts                # Database initialization
│   ├── export-utils.ts           # PDF export logic
│   ├── helpers.ts                # Helper functions
│   ├── pdf-utils.ts              # PDF processing
│   ├── pdf-worker.ts             # PDF worker thread
│   └── types.ts                  # TypeScript types
├── prisma/                       # Prisma ORM
│   ├── generated/                # Generated Prisma client
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
│   ├── fonts/                    # Custom font files
│   └── fontsDeclaration/         # Font CSS declarations
├── private/                      # Private files (PDFs, uploads)
├── express-uploader/             # Express file upload server
│   └── server.ts
├── scripts/                      # Utility scripts
│   └── auto-generate-fonts.ts
├── types/                        # TypeScript type definitions
├── .env                          # Environment variables
├── .env.example                  # Example environment file
├── .gitignore
├── bun.lock
├── components.json               # ShadCN config
├── docker-compose.yml            # Docker configuration
├── Dockerfile
├── entrypoint.sh                 # Docker entrypoint
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts
├── package.json
├── postcss.config.mjs            # PostCSS configuration
├── prisma.config.ts              # Prisma configuration
├── proxy.ts                      # Proxy configuration
├── README.md
├── tsconfig.json                 # TypeScript configuration
├── CUSTOM_FONTS_GUIDE.md         # Font setup guide
└── HINDI_FONT_SETUP.md           # Hindi font guide
```

### Key Directories Explained

#### `/app`
Next.js App Router directory containing all pages and API routes. Uses file-based routing with support for layouts, loading states, and error boundaries.

#### `/components`
Reusable React components organized by feature. Includes UI components from ShadCN and custom components for PDF editing, checkout, etc.

#### `/lib`
Utility functions and shared logic. Contains helpers for PDF processing, font management, database operations, and external service integrations.

#### `/prisma`
Database schema and Prisma client. The generated client is used throughout the application for type-safe database queries.

#### `/public`
Static assets served directly by Next.js. Includes custom fonts, images, and other public resources.

#### `/private`
Private files not served publicly. Contains uploaded PDFs and user-generated content.

---

## Core Features

### 1. Template Marketplace

**Browse Templates**
- Grid view of invitation templates
- Category filtering (Wedding, Birthday, Anniversary, etc.)
- Search functionality
- Pagination with "Load More"
- Template preview images

**Template Details**
- Full template information
- Price display
- Category and tags
- Purchase/Edit buttons
- Preview functionality

**Categories**
- WEDDING
- BIRTHDAY
- ANNIVERSARY
- GRADUATION
- BABYSHOWER
- FESTIVAL
- INVITATION
- CORPORATE
- OTHER

### 2. PDF Editor

**Text Overlays**
- Add text anywhere on PDF pages
- Drag-and-drop positioning
- Font customization (family, size, color)
- Bold and italic styling
- Text rotation (0-360 degrees)
- Multi-language support (English, Hindi)
- Unicode text normalization

**Shape Overlays**
- Add rectangular shapes
- Resize and reposition
- Color customization
- Rotation support
- Layer ordering

**Layer Management**
- Visual layer panel
- Drag-to-reorder layers
- Toggle visibility
- Delete layers
- Z-index control

**Export**
- Export edited PDF with all overlays
- Proper font embedding
- Maintains original PDF quality
- Custom filename

### 3. Payment System

**Razorpay Integration**
- Secure payment processing
- Order creation and verification
- Support for test and live modes
- Multiple payment methods
- Order status tracking

**Free Templates**
- Instant access to free templates
- No payment required
- Automatic template assignment

**Order Management**
- Order history
- Payment status tracking
- Receipt generation

### 4. User Management

**Authentication (Clerk)**
- Email/password sign-up
- Social login (Google, etc.)
- Session management
- Protected routes
- User profiles

**User Dashboard**
- View purchased templates
- Access template editor
- Manage account settings
- Order history

**My Templates**
- List of purchased templates
- Quick access to editor
- Template organization

### 5. Admin Features

**Template Management**
- Create new templates
- Upload PDF and preview images
- Set pricing and categories
- Add tags and descriptions
- Approve/reject templates
- Toggle template status

**Dashboard Analytics**
- Template statistics
- Order tracking
- User metrics

---

## API Routes

### Template APIs

#### GET `/api/design`
Fetch templates with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category (optional)

**Response:**
```json
{
  "data": [
    {
      "uuid": "template-id",
      "name": "Wedding Invitation",
      "description": "Beautiful wedding card",
      "price": 9900,
      "catogery": "WEDDING",
      "image": "https://...",
      "isPurchased": false
    }
  ]
}
```

#### GET `/api/design/[designId]`
Get single template details.

**Response:**
```json
{
  "uuid": "template-id",
  "name": "Wedding Invitation",
  "description": "...",
  "price": 9900,
  "pdf": "filename.pdf",
  "isPurchased": true
}
```

#### POST `/api/dashboard/design/create`
Create new template (admin only).

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Description",
  "catogary": "WEDDING",
  "tags": ["wedding", "elegant"],
  "price": "99",
  "paid": true,
  "placeholderImageFileName": "image.jpg",
  "pdfFileName": "template.pdf"
}
```

### Document Retrieval APIs

#### GET `/api/getPdf/[file]`
Retrieve PDF file.

**Response:** PDF file stream

#### GET `/api/getSvg/[file]`
Retrieve SVG file.

**Response:** SVG file stream

### Payment APIs

#### POST `/api/order`
Create Razorpay order.

**Request Body:**
```json
{
  "templateId": "template-uuid",
  "amount": 9900
}
```

**Response:**
```json
{
  "orderId": "order_xxxxx",
  "amount": 9900,
  "currency": "INR"
}
```

#### POST `/api/order/verify`
Verify Razorpay payment.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature",
  "templateId": "template-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified"
}
```

#### POST `/api/order/verify/free`
Process free template access.

**Request Body:**
```json
{
  "templateId": "template-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template added to your collection"
}
```

---

## PDF Editor System

### Architecture

The PDF editor is built using a combination of `pdfjs-dist` for rendering and `pdf-lib` for manipulation.

```
┌─────────────────────────────────────────────────────────┐
│                    PDF Editor Component                  │
│  ┌────────────────────────────────────────────────┐     │
│  │  PDFCanvas (Rendering & Interaction)           │     │
│  │  - pdfjs-dist for PDF rendering                │     │
│  │  - Canvas-based overlay rendering              │     │
│  │  - Drag-and-drop positioning                   │     │
│  └────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────┐     │
│  │  FormattingToolbar (Text/Shape Properties)     │     │
│  │  - Font selection                              │     │
│  │  - Size, color, rotation controls              │     │
│  │  - Bold/italic toggles                         │     │
│  └────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────┐     │
│  │  LayersPanel (Layer Management)                │     │
│  │  - Layer list with drag-to-reorder            │     │
│  │  - Visibility toggles                          │     │
│  │  - Delete layers                               │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Export System (export-utils.ts)             │
│  - pdf-lib for PDF manipulation                         │
│  - fontkit for custom font embedding                    │
│  - Coordinate transformation (canvas → PDF)             │
│  - Rotation matrix calculations                         │
└─────────────────────────────────────────────────────────┘
```

### Overlay System

#### Text Overlay Interface

```typescript
interface TextOverlay {
  id: string;
  type: "text";
  text: string;
  x: number;              // Normalized 0-1
  y: number;              // Normalized 0-1
  fontSize: number;       // In pixels
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;          // Hex color
  page: number;
  visible: boolean;
  zIndex: number;
  rotation: number;       // Degrees 0-360
  fontFamilyClassName?: string;
}
```

#### Shape Overlay Interface

```typescript
interface ShapeOverlay {
  id: string;
  type: "shape";
  shapeType: "square";
  x: number;              // Normalized 0-1
  y: number;              // Normalized 0-1
  width: number;          // Normalized 0-1
  height: number;         // Normalized 0-1
  color: string;          // Hex color
  page: number;
  visible: boolean;
  zIndex: number;
  rotation: number;       // Degrees 0-360
}
```

### Coordinate System

**Canvas Coordinates (Display)**
- Origin: Top-left corner
- X: Left to right (0 to canvas width)
- Y: Top to bottom (0 to canvas height)
- Scale: 1.5x for high-DPI displays

**PDF Coordinates (Export)**
- Origin: Bottom-left corner
- X: Left to right (0 to page width)
- Y: Bottom to top (0 to page height)
- Scale: Points (72 DPI)

**Normalization**
All overlay positions are stored as normalized values (0-1) relative to page dimensions, making them resolution-independent.

### Export Process

1. **Load Original PDF**: Read PDF file using pdf-lib
2. **Register FontKit**: Enable custom font embedding
3. **Embed Fonts**: Load and embed all required fonts
4. **Sort Overlays**: Order by zIndex (bottom to top)
5. **Transform Coordinates**: Convert normalized → PDF coordinates
6. **Apply Rotation**: Use transformation matrices for rotated elements
7. **Draw Overlays**: Render text and shapes on PDF pages
8. **Save PDF**: Generate final PDF blob

### Font Handling

**Standard Fonts**
- Arial → Helvetica
- Times New Roman → Times-Roman
- Courier New → Courier

**Custom Fonts**
- Loaded from `/public/fonts/`
- Embedded using fontkit
- Support for TTF format
- Unicode normalization for Hindi text

**Font Embedding Process**
```typescript
// 1. Load font file
const fontBytes = await fetch('/fonts/font.ttf')
  .then(res => res.arrayBuffer());

// 2. Embed in PDF
const customFont = await pdfDoc.embedFont(fontBytes);

// 3. Use in text drawing
page.drawText(text, {
  font: customFont,
  size: fontSize,
  color: rgb(r, g, b)
});
```

### Rotation Implementation

Rotation uses PDF transformation matrices:

```typescript
// Save graphics state
page.pushOperators(pushGraphicsState());

// Translate to rotation center
page.pushOperators(translate(centerX, centerY));

// Apply rotation (negative for clockwise)
const radians = -(rotation * Math.PI) / 180;
page.pushOperators(rotateRadians(radians));

// Translate back
page.pushOperators(translate(-centerX, -centerY));

// Draw element
page.drawText(text, { x, y, ... });

// Restore graphics state
page.pushOperators(popGraphicsState());
```

---

## Payment Integration

### Razorpay Setup

#### 1. Create Razorpay Account
- Sign up at [Razorpay](https://razorpay.com/)
- Complete KYC verification
- Get API keys from Dashboard → Settings → API Keys

#### 2. Test Mode vs Live Mode
- **Test Mode**: Use test keys for development
- **Live Mode**: Use live keys for production
- Test cards available in [Razorpay Docs](https://razorpay.com/docs/payments/payments/test-card-details/)

#### 3. Integration Flow

```
User clicks "Purchase"
        ↓
Frontend creates order (POST /api/order)
        ↓
Backend creates Razorpay order
        ↓
Frontend opens Razorpay checkout modal
        ↓
User completes payment
        ↓
Razorpay callback with payment details
        ↓
Frontend verifies payment (POST /api/order/verify)
        ↓
Backend verifies signature & saves to database
        ↓
Template added to user's collection
```

### Payment Verification

**Signature Verification**
```typescript
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!
});

// Verify signature
const body = orderId + "|" + paymentId;
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET!)
  .update(body)
  .digest("hex");

const isValid = expectedSignature === signature;
```

### Free Template Flow

For free templates (price = 0):
1. User clicks "Get Free Template"
2. Frontend calls `/api/order/verify/free`
3. Backend creates SavedTemplate record
4. User gets immediate access

### Order Status

- **pending**: Order created, payment not completed
- **completed**: Payment verified and successful
- **failed**: Payment failed or verification failed

---

## Authentication & Authorization

### Clerk Integration

#### Setup

1. **Create Clerk Application**
   - Sign up at [Clerk](https://clerk.com/)
   - Create new application
   - Choose authentication methods (email, social, etc.)

2. **Configure Environment**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

3. **Wrap Application**
   ```typescript
   // app/layout.tsx
   import { ClerkProvider } from '@clerk/nextjs';
   
   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         {children}
       </ClerkProvider>
     );
   }
   ```

#### Protected Routes

**Client-Side Protection**
```typescript
import { useAuth } from '@clerk/nextjs';

export default function ProtectedPage() {
  const { isSignedIn, userId } = useAuth();
  
  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }
  
  return <div>Protected content</div>;
}
```

**Server-Side Protection**
```typescript
import { auth } from '@clerk/nextjs/server';

export default async function ServerPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Fetch user-specific data
}
```

**API Route Protection**
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process request
}
```

#### User Data

**Get Current User**
```typescript
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();
console.log(user.id, user.emailAddresses[0].emailAddress);
```

**User Metadata**
Clerk stores user information including:
- Email addresses
- Profile images
- First/last name
- Custom metadata

#### Sign-In/Sign-Up Pages

Clerk provides pre-built components:
```typescript
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <SignIn />;
}
```

### Authorization Patterns

**Template Ownership**
```typescript
// Check if user owns template
const savedTemplate = await prisma.savedTemplate.findFirst({
  where: {
    userId: userId,
    templateId: templateId
  }
});

if (!savedTemplate) {
  return new Response('Not authorized', { status: 403 });
}
```

**Admin Check**
```typescript
// Check if user is admin (using Clerk metadata)
const user = await currentUser();
const isAdmin = user?.publicMetadata?.role === 'admin';

if (!isAdmin) {
  return new Response('Admin access required', { status: 403 });
}
```

---

## Font Management

### Supported Fonts

#### Standard Fonts
- Arial
- Helvetica
- Times New Roman
- Courier New
- Verdana
- Georgia
- Palatino

#### Hindi Fonts

**Unicode Fonts (Recommended)**
- **Noto Sans Devanagari Regular**: Full Unicode support, works with copy-paste

**Legacy Fonts (Typing Only)**
- **AMS Aasmi**: Legacy Hindi font
- **Kruti Dev 640**: Legacy Devanagari font
- **Kruti Dev 010, 011, 012, 021, 240, 500, 501, 502, 680, 710, 712, 714, 732**
- **BHARTIYA HINDI 112, 142**
- **A-SuperHindi-3 Bold, A-SuperHindi-8 Normal**

#### English/Latin Fonts
- **Arial**: Standard sans-serif
- **Martel**: Regular weight serif font
- **Martel Bold**: Bold weight serif font
- **Rozha One Regular**: Decorative serif font
- **Teko Regular**: Condensed sans-serif
- **Teko Medium**: Medium weight condensed sans-serif
- **Teko Bold**: Bold weight condensed sans-serif

#### Decorative Fonts
- **Arenski**: Decorative display font
- **Embassy BT**: Elegant script font
- **ITC Bookman Demi Italic**: Classic serif italic
- **Monotype Corsiva Regular Italic**: Elegant script italic
- **ISFOC TTBorder 1 Normal**: Bordered decorative font

### Adding Custom Fonts

#### 1. Add Font File

Place TTF font file in `public/fonts/`:
```bash
public/fonts/MyCustomFont.ttf
```

#### 2. Register Font

Add to `lib/custom-fonts.ts`:
```typescript
export const customFonts: CustomFont[] = [
  // ... existing fonts
  {
    name: "My Custom Font",
    url: "/fonts/MyCustomFont.ttf",
    fontFamily: "My Custom Font",
    format: "truetype",
  },
];
```

#### 3. Add to Font Selector

Update `components/formatting-toolbar.tsx`:
```typescript
const fonts = [
  "Arial",
  "Helvetica",
  // ... existing fonts
  "My Custom Font",
];
```

#### 4. Declare CSS Font Face

Add to `app/fonts.css`:
```css
@font-face {
  font-family: 'My Custom Font';
  src: url('/fonts/MyCustomFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

### Font Loading Process

**Client-Side (Display)**
1. Font declared in CSS via `@font-face`
2. Browser loads font when needed
3. Applied to canvas text rendering

**Server-Side (Export)**
1. Font file fetched from `/public/fonts/`
2. Loaded as ArrayBuffer
3. Embedded in PDF using fontkit
4. Used for text drawing in exported PDF

### Unicode Normalization

For proper Hindi text rendering:
```typescript
// Normalize Unicode text before export
const normalizedText = text.normalize('NFC');
```

This ensures consistent character representation across different input methods.

### Font Troubleshooting

**Font not appearing in dropdown**
- Check font is added to `custom-fonts.ts`
- Verify font file exists in `public/fonts/`
- Restart development server

**Font not rendering in export**
- Ensure font file is valid TTF format
- Check browser console for loading errors
- Verify fontkit is properly registered

**Hindi text shows as boxes**
- Use Unicode font (Noto Sans Devanagari)
- Legacy fonts only work with keyboard typing
- Ensure text is normalized

---

## Deployment

### Docker Deployment

#### Build Docker Image

```bash
docker build -t nice-card .
```

#### Run with Docker Compose

```bash
docker-compose up -d
```

The `docker-compose.yml` configuration:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - DATABASE_URL=${DATABASE_URL}
        - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    container_name: nice-card-app
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./private:/app/private
```

#### Environment Variables in Docker

Ensure `.env` file is present with all required variables before running docker-compose.

### VPS Deployment

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Bun installed
- PostgreSQL database
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

#### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd nice-card
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Setup Database**
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Build Application**
   ```bash
   bun run build
   ```

6. **Start Application**
   ```bash
   bun run start
   ```

7. **Setup Process Manager (PM2)**
   
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "nice-card-server",
         cwd: "/root/app/nice-cards",
         script: "bun",
         args: "run start",
         env: {
           NODE_ENV: "production",
         }
       },
       {
         name: "nice-card-uploader",
         script: "bun",
         cwd: "/root/app/nice-cards",
         args: "run upload-server",
         env: {
           PORT: 5005,
           NODE_ENV: "production",
         }
       }
     ]
   };
   ```
   
   Start with PM2:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### SSL Setup with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Vercel Deployment

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Deploy

```bash
vercel
```

#### 3. Configure Environment Variables

Add all environment variables in Vercel dashboard:
- Project Settings → Environment Variables

#### 4. Configure Build Settings

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "installCommand": "bun install"
}
```

**Note**: Vercel has limitations with Bun runtime. Consider using Node.js runtime for Vercel deployments.

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Clerk production keys configured
- [ ] Razorpay live keys configured
- [ ] Brevo production SMTP configured
- [ ] Custom fonts uploaded
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Backup strategy implemented
- [ ] CDN configured for static assets
- [ ] Rate limiting enabled
- [ ] Security headers configured

### PM2 Process Management

The application runs two PM2 processes:

1. **nice-card-server**: Main Next.js application (port 3000)
2. **nice-card-uploader**: Express file upload server (port 5005)

**PM2 Commands**

```bash
# Start all processes
pm2 start ecosystem.config.js

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all

# Stop specific process
pm2 stop nice-card-server
pm2 stop nice-card-uploader

# Restart specific process
pm2 restart nice-card-server
pm2 restart nice-card-uploader

# Delete process
pm2 delete nice-card-server

# View process status
pm2 status

# View real-time monitoring
pm2 monit

# View logs
pm2 logs
pm2 logs nice-card-server --lines 100

# Clear logs
pm2 flush

# Save current process list
pm2 save

# Resurrect saved processes on reboot
pm2 resurrect
```

**Auto-restart on System Reboot**

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### Monitoring

**Application Logs**
```bash
# PM2 logs (view all apps)
pm2 logs

# PM2 logs (specific app)
pm2 logs nice-card-server
pm2 logs nice-card-uploader

# PM2 status
pm2 status

# PM2 monitoring
pm2 monit

# Docker logs
docker logs nice-card-app
```

**Database Monitoring**
```bash
# Check database connections
bunx prisma studio
```

**Performance Monitoring**
- Use Vercel Analytics for Vercel deployments
- Setup custom monitoring with tools like New Relic or Datadog

---

## Development Workflow

### Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint

# Generate font declarations
bun run generate:fonts

# Start upload server
bun run upload-server
```

### Development Best Practices

#### 1. Code Organization

**Component Structure**
```typescript
// components/MyComponent.tsx
"use client"; // Only if needed

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

**API Route Structure**
```typescript
// app/api/my-route/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await prisma.model.findMany({
      where: { userId }
    });
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Type Safety

**Define Types**
```typescript
// lib/types.ts
export interface Template {
  uuid: string;
  name: string;
  price: number;
  // ... other fields
}

export type TemplateCategory = 
  | 'WEDDING'
  | 'BIRTHDAY'
  | 'ANNIVERSARY'
  // ... other categories
```

**Use Zod for Validation**
```typescript
import { z } from 'zod';

const TemplateSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().min(0),
  category: z.enum(['WEDDING', 'BIRTHDAY', ...])
});

// Validate data
const result = TemplateSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}
```

#### 3. Error Handling

**Client-Side**
```typescript
import { toast } from 'sonner';

try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('Request failed');
  const data = await response.json();
  toast.success('Success!');
} catch (error) {
  console.error(error);
  toast.error('Something went wrong');
}
```

**Server-Side**
```typescript
try {
  // Database operation
  const result = await prisma.model.create({ data });
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'Failed to create record' },
    { status: 500 }
  );
}
```

#### 4. Database Queries

**Efficient Queries**
```typescript
// Include related data
const template = await prisma.template.findUnique({
  where: { uuid: id },
  include: {
    savedTemplates: {
      where: { userId }
    }
  }
});

// Select specific fields
const templates = await prisma.template.findMany({
  select: {
    uuid: true,
    name: true,
    price: true,
    image: true
  }
});
```

#### 5. Performance Optimization

**Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Template"
  width={400}
  height={300}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

**Code Splitting**
```typescript
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(
  () => import('@/components/pdf-editor'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

**Memoization**
```typescript
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Git Workflow

#### Branch Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name
fix/bug-name
```

#### Commit Messages

```bash
# Feature
git commit -m "feat: add template rotation feature"

# Bug fix
git commit -m "fix: resolve PDF export font issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: optimize PDF rendering performance"
```

### Testing

#### Manual Testing Checklist

- [ ] User authentication (sign up, sign in, sign out)
- [ ] Template browsing and filtering
- [ ] Template purchase flow
- [ ] PDF editor functionality
  - [ ] Add text overlays
  - [ ] Add shape overlays
  - [ ] Font customization
  - [ ] Rotation
  - [ ] Layer management
  - [ ] Export PDF
- [ ] Payment processing
- [ ] Email notifications
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

#### Test Payment

Use Razorpay test cards:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

---

## Troubleshooting

### Common Issues

#### 1. PDF Editor Issues

**Problem: Text shows as boxes in exported PDF**

**Solution:**
- Use Unicode fonts (Noto Sans Devanagari) for Hindi text
- Legacy fonts (AMS Aasmi, Kruti Dev) only work with keyboard typing
- Ensure text is normalized: `text.normalize('NFC')`

**Problem: Fonts not appearing in dropdown**

**Solution:**
```bash
# 1. Check font is registered in lib/custom-fonts.ts
# 2. Verify font file exists in public/fonts/
# 3. Restart development server
bun run dev
```

**Problem: PDF export fails**

**Solution:**
- Check browser console for errors
- Verify font files are accessible
- Ensure pdf-lib and fontkit are installed:
```bash
bun install pdf-lib @pdf-lib/fontkit fontkit
```

**Problem: Text positioning incorrect in export**

**Solution:**
- Canvas uses 1.5x scale factor
- Coordinates are normalized (0-1)
- PDF origin is bottom-left, canvas is top-left
- Check coordinate transformation in `export-utils.ts`

#### 2. Database Issues

**Problem: Prisma client not found**

**Solution:**
```bash
bunx prisma generate
```

**Problem: Database connection failed**

**Solution:**
- Verify DATABASE_URL in `.env`
- Check database server is running
- Test connection:
```bash
bunx prisma db push
```

**Problem: Migration conflicts**

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# Or manually resolve conflicts
bunx prisma migrate resolve
```

#### 3. Authentication Issues

**Problem: Clerk authentication not working**

**Solution:**
- Verify Clerk keys in `.env`
- Check Clerk dashboard for application status
- Ensure ClerkProvider wraps application
- Clear browser cookies and try again

**Problem: User not authorized to access template**

**Solution:**
```typescript
// Check SavedTemplate record exists
const saved = await prisma.savedTemplate.findFirst({
  where: {
    userId: userId,
    templateId: templateId
  }
});
```

#### 4. Payment Issues

**Problem: Razorpay checkout not opening**

**Solution:**
- Verify Razorpay script is loaded:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
- Check NEXT_PUBLIC_RAZORPAY_KEY_ID is set
- Open browser console for errors

**Problem: Payment verification fails**

**Solution:**
- Check RAZORPAY_SECRET is correct
- Verify signature calculation:
```typescript
const body = orderId + "|" + paymentId;
const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_SECRET)
  .update(body)
  .digest("hex");
```

#### 5. Build Issues

**Problem: Build fails with TypeScript errors**

**Solution:**
```bash
# Check for type errors
bun run lint

# Fix common issues
# - Add missing type definitions
# - Fix any type assertions
# - Ensure all imports are correct
```

**Problem: Canvas module not found**

**Solution:**
The canvas module is externalized in `next.config.ts`:
```typescript
config.externals.push({
  canvas: "commonjs canvas",
});
```

Ensure canvas is installed:
```bash
bun install canvas
```

#### 6. Performance Issues

**Problem: PDF rendering slow**

**Solution:**
- Use lower canvas scale for preview
- Implement pagination for multi-page PDFs
- Lazy load PDF pages
- Use Web Workers for PDF processing

**Problem: Large bundle size**

**Solution:**
- Use dynamic imports for heavy components
- Optimize images with Next.js Image component
- Remove unused dependencies
- Enable tree shaking

#### 7. Email Issues

**Problem: Emails not sending**

**Solution:**
- Verify Brevo SMTP credentials in `.env`
- Check SMTP_HOST: `smtp-relay.brevo.com`
- Check SMTP_PORT: `587`
- Test SMTP connection:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.verify();
```

**Problem: Emails going to spam**

**Solution:**
- Configure SPF, DKIM, and DMARC records
- Use verified sender email in Brevo
- Avoid spam trigger words
- Include unsubscribe link

### Debug Mode

Enable detailed logging:

```typescript
// lib/export-utils.ts
console.log('=== PDF EXPORT DEBUG ===');
console.log('Overlays:', overlays);
console.log('Fonts:', fontCache);
```

### Getting Help

1. **Check Documentation**
   - README.md
   - CUSTOM_FONTS_GUIDE.md
   - HINDI_FONT_SETUP.md

2. **Review Logs**
   ```bash
   # Development logs
   bun run dev
   
   # Production logs (PM2)
   pm2 logs nice-card-server
   pm2 logs nice-card-uploader
   
   # PM2 error logs only
   pm2 logs --err
   
   # Docker logs
   docker logs nice-card-app
   ```

3. **Browser DevTools**
   - Console for JavaScript errors
   - Network tab for API requests
   - Application tab for storage/cookies

4. **Database Inspection**
   ```bash
   bunx prisma studio
   ```

---

## Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [pdfjs Documentation](https://mozilla.github.io/pdf.js/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [ShadCN/UI Documentation](https://ui.shadcn.com/)

### Related Files

- `README.md` - Quick start guide
- `CUSTOM_FONTS_GUIDE.md` - Font setup instructions
- `HINDI_FONT_SETUP.md` - Hindi font configuration
- `.env.example` - Environment variable template

---

## License & Ownership

This project is **private and proprietary**. All rights reserved.

- **Owner**: Nice-Card
- **Developer**: DeepVoidLab
- **Status**: Private/Confidential
- **Distribution**: Not permitted without authorization

### Confidentiality

- Do not share code externally
- Do not publish to public repositories
- Keep all credentials secure
- Use only authorized development environments

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Maintained By**: DeepVoidLab

