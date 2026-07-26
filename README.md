# Store — Full-Stack E-Commerce Platform

A production-ready, Arabic-first e-commerce platform built with Next.js 15, Prisma, PostgreSQL, and NextAuth v5.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3 (App Router) |
| Language | TypeScript 5.8 |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Auth | NextAuth v5 (JWT + Prisma Adapter) |
| ORM | Prisma 6.12 |
| Database | PostgreSQL |
| State | Zustand (cart), React Query (data) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Email | Resend + React Email |
| Images | Cloudinary |

## Features

- **Full Storefront** — Product browsing, categories, search, cart, checkout, order history
- **Admin Panel** — Dashboard, products, categories, orders, customers, inventory, accounting, reports, audit logs, recycle bin
- **Multi-Role Auth** — Admin, Employee, Customer with route-level protection
- **Product Variants** — Size, color, and custom attributes with independent SKU/price/stock
- **Inventory Management** — Stock tracking with full transaction history (purchase, sale, adjustment, return, cancellation)
- **Financial Module** — Expenses, expense categories, income/expense ledger, profit reporting
- **Audit Logging** — Complete admin action trail with before/after snapshots
- **Soft Delete** — Trash/restore for products and categories
- **RTL/Arabic** — Arabic-first UI with localized validation messages
- **Dark/Light Theme** — System-aware with manual toggle

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted like Neon/Supabase)
- Cloudinary account (for image uploads)
- Resend account (for transactional emails)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="onboarding@resend.dev"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Admin User

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:run` | Run migrations |
| `npm run db:seed` | Seed default admin user |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
store/
├── prisma/
│   ├── schema.prisma          # Database schema (20+ models)
│   └── seed.ts                # Seed script
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (storefront)/      # Customer-facing pages
│   │   │   ├── page.tsx       # Home
│   │   │   ├── products/      # Product listing & detail
│   │   │   ├── categories/    # Category pages
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── checkout/      # Checkout flow
│   │   │   ├── orders/        # Order history
│   │   │   └── account/       # Profile, addresses
│   │   ├── (auth)/            # Login, register, forgot-password
│   │   ├── admin/             # Admin panel
│   │   │   ├── dashboard/     # Overview & charts
│   │   │   ├── products/      # Product management
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Order management
│   │   │   ├── customers/     # Customer management
│   │   │   ├── inventory/     # Stock management
│   │   │   ├── accounting/    # Expenses & ledger
│   │   │   ├── reports/       # Analytics & reports
│   │   │   ├── audit-logs/    # Admin action history
│   │   │   ├── settings/      # Store configuration
│   │   │   └── recycle-bin/   # Soft-deleted items
│   │   └── api/               # API routes (33+ endpoints)
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities, auth, config, validations
│   ├── services/              # Business logic layer
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript type definitions
└── middleware.ts              # Route protection (admin, account)
```

## Database Models

| Model | Description |
|---|---|
| User | Users with roles (ADMIN, EMPLOYEE, CUSTOMER) |
| Product / ProductVariant | Products with optional variants (size, color, etc.) |
| Category | Hierarchical categories (parent/child) |
| Brand | Product brands |
| Cart / CartItem | Shopping cart (user or anonymous session) |
| Order / OrderItem | Orders with status tracking |
| OrderTimeline | Order status change history |
| InventoryTransaction | Stock movement records |
| AuditLog | Admin action audit trail |
| Expense / ExpenseCategory | Expense tracking |
| Transaction | Income/expense ledger |
| Address | User shipping addresses |
| Notification | Per-user notifications |
| StoreSetting | Key-value store configuration |

## Authentication

- **Strategy**: JWT (stateless)
- **Provider**: Email + Password (bcrypt)
- **Roles**: Admin, Employee, Customer
- **Route Protection**: Middleware enforces role-based access on `/admin/*`, `/account/*`, `/orders/*`, and `/checkout`

## Admin Roles

| Role | Access |
|---|---|
| Admin | Full access to all admin features |
| Employee | Order management and basic operations |
| Customer | Storefront only |

## API Routes

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products (filter, sort, paginate) |
| GET | `/api/products/[slug]` | Product detail |
| GET | `/api/categories` | Category tree |
| GET | `/api/categories/[slug]` | Category products |
| GET | `/api/settings` | Store settings |

### Authenticated
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/orders` | List/create orders |
| GET | `/api/orders/[id]` | Order detail |
| POST | `/api/auth/register` | Register account |
| POST | `/api/auth/forgot-password` | Reset password |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard stats |
| POST/PUT/DELETE | `/api/admin/products/*` | Product CRUD |
| POST/PUT/DELETE | `/api/admin/categories/*` | Category CRUD |
| POST/PUT/DELETE | `/api/admin/orders/*` | Order management |
| GET/PUT | `/api/admin/customers` | Customer management |
| POST/PUT/DELETE | `/api/admin/expenses/*` | Expense CRUD |
| GET | `/api/admin/reports/*` | Analytics & reports |
| PUT | `/api/admin/settings` | Update store settings |
| GET | `/api/admin/audit-logs` | Audit trail |

## Configuration

Store settings (currency symbol, tax rate, shipping cost, theme) are managed via the `/admin/settings` page and stored in the `StoreSetting` table. All prices throughout the application dynamically read from these settings.

## License

Private — All rights reserved.
