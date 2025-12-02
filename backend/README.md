# Mini ERP + Client Portal - Backend

Express.js REST API with Prisma ORM and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from example):
```
DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH="./uploads"
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Seed the database:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - List leads
- `GET /api/leads/:id` - Get lead
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert to client

### Clients
- `GET /api/clients` - List clients
- `GET /api/clients/:id` - Get client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/:id/income` - Get income

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Claims
- `GET /api/claims` - List claims
- `GET /api/claims/:id` - Get claim
- `POST /api/claims` - Create claim
- `PUT /api/claims/:id` - Update claim
- `DELETE /api/claims/:id` - Delete claim
- `POST /api/claims/:id/attachments` - Upload file

### Dashboard
- `GET /api/dashboard/admin` - Admin stats
- `GET /api/dashboard/supervisor` - Supervisor stats
- `GET /api/dashboard/operator` - Operator stats
- `GET /api/dashboard/client` - Client portal stats

## Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── modules/        # Feature modules
│   ├── auth/
│   ├── users/
│   ├── leads/
│   ├── clients/
│   ├── products/
│   ├── claims/
│   └── dashboard/
├── utils/          # Utility functions
└── types/          # TypeScript types
```

## Roles

- **ADMIN** - Full system access
- **SUPERVISOR** - Manage leads, clients, claims
- **OPERATOR** - Work with assigned leads/claims
- **CLIENT** - Portal access only

