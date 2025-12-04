# ===============================================
# Concurrent Frontend and Backend Runner Makefile
# ===============================================

# -----------------
# Configuration
# -----------------
FRONTEND_DIR = frontend
BACKEND_DIR = backend
BACKEND_PORT = 3001
FRONTEND_PORT = 3000

.PHONY: all run install-frontend install-backend install setup-env clean stop-ports

# Default target
all: run

# ===============================================
# Stop processes on ports
# ===============================================
stop-ports:
	@echo "Checking for processes on ports $(BACKEND_PORT) and $(FRONTEND_PORT)..."
	@-lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@-lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "✓ Ports cleared."

# ===============================================
# Setup Environment File
# ===============================================
setup-env:
	@echo "Creating backend/.env file..."
	@printf "DATABASE_URL=\"postgresql://neondb_owner:npg_n8RMGx1tvZrd@ep-long-silence-absko2q2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require\"\n" > backend/.env
	@printf "JWT_SECRET=\"super-secret-jwt-key-for-mini-erp-2024\"\n" >> backend/.env
	@printf "JWT_REFRESH_SECRET=\"super-secret-refresh-key-for-mini-erp-2024\"\n" >> backend/.env
	@printf "JWT_EXPIRES_IN=\"15m\"\n" >> backend/.env
	@printf "JWT_REFRESH_EXPIRES_IN=\"7d\"\n" >> backend/.env
	@printf "PORT=3001\n" >> backend/.env
	@printf "NODE_ENV=\"development\"\n" >> backend/.env
	@printf "CORS_ORIGIN=\"http://localhost:3000\"\n" >> backend/.env
	@printf "UPLOAD_MAX_SIZE=5242880\n" >> backend/.env
	@printf "UPLOAD_PATH=\"./uploads\"\n" >> backend/.env
	@echo "✓ .env file created successfully."

# ===============================================
# Install Dependencies
# ===============================================
install-frontend:
	@echo "Installing frontend dependencies..."
	@cd $(FRONTEND_DIR) && npm install
	@echo "✓ Frontend dependencies installed."

install-backend:
	@echo "Installing backend dependencies..."
	@cd $(BACKEND_DIR) && npm install
	@echo "✓ Backend dependencies installed."

install: install-frontend install-backend
	@echo "✓ All dependencies installed."

# ===============================================
# Run Target: Install, setup, and start both services
# ===============================================
run: stop-ports install setup-env
	@echo "--- Starting Services in Development Mode ---"
	@echo "Starting Backend and Frontend with hot-reload..."
	@echo "Press Ctrl+C to stop both services."
	@echo "-------------------------"
	@cd $(BACKEND_DIR) && npm run dev & cd $(FRONTEND_DIR) && npm run dev

# ===============================================
# Individual Service Targets
# ===============================================
frontend: install-frontend
	@echo "Starting Frontend only..."
	@-lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true
	@cd $(FRONTEND_DIR) && npm run dev

backend: install-backend setup-env
	@echo "Starting Backend only..."
	@-lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@cd $(BACKEND_DIR) && npm run dev

# ===============================================
# Clean Target
# ===============================================
clean:
	@rm -f backend/.env
	@rm -rf backend/node_modules frontend/node_modules
	@rm -rf backend/dist
	@echo "✓ Environment file, dependencies, and build artifacts removed."

# ===============================================
# Stop all running services
# ===============================================
stop: stop-ports
	@echo "✓ All services stopped."