# Mini ERP + Client Portal - Frontend

Next.js 14 frontend with Tailwind CSS, Zustand state management, and React Hook Form.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start development server:
```bash
npm run dev
```

The app runs on `http://localhost:3000`

## Features

### Staff Dashboard (`/dashboard`)
- **Dashboard** - Overview with stats and activity
- **Users** - User management (Admin only)
- **Leads** - Lead tracking and conversion
- **Clients** - Client management with subscriptions
- **Products** - Product/service catalog
- **Claims** - Support claim management
- **Settings** - Account settings

### Client Portal (`/portal`)
- **Dashboard** - Client overview
- **My Claims** - View and submit claims
- **Subscriptions** - View active subscriptions
- **Profile** - Update profile information

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **Icons:** Lucide React
- **Charts:** Recharts
- **Toasts:** React Hot Toast

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # Staff dashboard
│   └── portal/          # Client portal
├── components/
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── hooks/               # Custom hooks
├── lib/                 # Utilities and API client
├── store/               # Zustand stores
└── types/               # TypeScript types
```

## Role-Based Access

| Role | Access |
|------|--------|
| ADMIN | Full dashboard access |
| SUPERVISOR | Dashboard (no user management) |
| OPERATOR | Limited dashboard access |
| CLIENT | Client portal only |

## Demo Credentials

After seeding the backend:
- **Admin:** admin@minicrm.com / Admin@123
- **Operator:** operator@minicrm.com / Oper@123
- **Client:** client@acmecorp.com / Client@123

