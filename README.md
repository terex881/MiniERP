# Mini ERP + Client Portal

A full-stack enterprise resource planning (ERP) system with an integrated client portal for managing claims, clients, leads, products, and users.

## 🚀 Features

- **Authentication & Authorization**: Role-based access control (Admin, Supervisor, Operator, Client)
- **Claims Management**: Track and manage client claims with status, priority, and attachments
- **Client Management**: Comprehensive client database with profile management
- **Lead Management**: Convert leads to clients with status tracking
- **Product Management**: Manage products and client subscriptions
- **Dashboard**: Analytics and overview for administrators
- **Client Portal**: Self-service portal for clients to manage their claims and profile

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
.
├── backend/          # Express.js API server
│   ├── prisma/       # Database schema and migrations
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── middleware/ # Express middleware
│   │   ├── modules/  # Feature modules (auth, claims, clients, etc.)
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Utility functions
│   └── uploads/      # File upload directory
│
└── frontend/         # Next.js application
    └── src/
        ├── app/      # Next.js app router pages
        ├── components/ # React components
        ├── hooks/    # Custom React hooks
        ├── lib/      # Utility libraries
        ├── store/    # Zustand stores
        └── types/    # TypeScript type definitions
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn
- Make (optional, but recommended for easier setup)

### Quick Start (Using Makefile)

The easiest way to get started is using the provided Makefile:

1. **Clone the repository**
   ```bash
   git clone git@github.com:terex881/MiniERP.git
   cd MiniERP
   ```

2. **Run everything with one command**
   ```bash
   make run
   ```
   
   This will:
   - Install all dependencies (frontend and backend)
   - Create the backend `.env` file with default configuration
   - Start both frontend and backend servers concurrently
   
   The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

### Manual Installation

If you prefer to set up manually:

1. **Clone the repository**
   ```bash
   git clone git@github.com:terex881/MiniERP.git
   cd MiniERP
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables**

   The Makefile can automatically create the `.env` file for you (see Quick Start section below), or you can create it manually:
   
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_n8RMGx1tvZrd@ep-long-silence-absko2q2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="super-secret-jwt-key-for-mini-erp-2024"
   JWT_REFRESH_SECRET="super-secret-refresh-key-for-mini-erp-2024"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:3000"
   UPLOAD_MAX_SIZE=5242880
   UPLOAD_PATH="./uploads"
   ```

2. **Frontend Environment Variables**

   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Database Setup

1. **Generate Prisma Client**
   ```bash
   cd backend
   npm run prisma:generate
   ```

2. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

### Running the Application

#### Using Makefile (Recommended)

**Run both services together:**
```bash
make run
```

**Run services individually:**
```bash
make frontend    # Start only frontend
make backend     # Start only backend
```

**Other useful Makefile commands:**
```bash
make install          # Install all dependencies
make install-frontend # Install frontend dependencies only
make install-backend  # Install backend dependencies only
make setup-env        # Create backend .env file
make stop             # Stop all running services
make clean            # Remove node_modules, .env, and build artifacts
```

#### Manual Running

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 📝 Available Commands

### Makefile Commands

- `make run` - Install dependencies, setup environment, and start both services
- `make install` - Install all dependencies (frontend and backend)
- `make install-frontend` - Install frontend dependencies only
- `make install-backend` - Install backend dependencies only
- `make setup-env` - Create backend `.env` file with default configuration
- `make frontend` - Start only the frontend development server
- `make backend` - Start only the backend development server
- `make stop` - Stop all running services and clear ports
- `make clean` - Remove node_modules, .env file, and build artifacts

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run seed` - Seed the database

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 User Roles

- **ADMIN**: Full system access
- **SUPERVISOR**: Management and oversight capabilities
- **OPERATOR**: Standard operational access
- **CLIENT**: Limited access to own data through portal

## 📚 API Endpoints

The backend provides RESTful APIs for:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/clients` - Client management
- `/api/leads` - Lead management
- `/api/products` - Product management
- `/api/claims` - Claims management
- `/api/dashboard` - Dashboard analytics
- `/api/portal` - Client portal endpoints

## 🧪 Development

### Code Structure

- **Backend**: Modular architecture with separate controllers, services, and routes for each feature
- **Frontend**: Component-based architecture with custom hooks for API interactions
- **Type Safety**: Full TypeScript support across both frontend and backend

### Best Practices

- Use TypeScript for type safety
- Validate inputs with Zod schemas
- Follow RESTful API conventions
- Implement proper error handling
- Use middleware for authentication and authorization