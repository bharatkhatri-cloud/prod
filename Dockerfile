# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies for workspace building
RUN npm install

# Copy frontend source and build optimized production bundle
COPY frontend/ ./frontend/
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
ENV REACT_APP_BACKEND_PORT_AND_HOST=/
ENV REACT_APP_SPRING_BACKEND=/
RUN npm run build:frontend

# ==========================================
# Stage 2: Production Server Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies for backend workspace only
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
RUN npm install --omit=dev --workspace=backend

# Copy backend application source and configs
COPY backend/ ./backend/
COPY .env.example ./.env.example

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Expose internal container port
EXPOSE 3000

# Health check to ensure Express and API routes respond
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v2s/settings || exit 1

# Start the unified Express server
CMD ["npm", "start"]
