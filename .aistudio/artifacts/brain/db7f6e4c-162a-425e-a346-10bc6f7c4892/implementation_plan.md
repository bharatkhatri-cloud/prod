# Local Docker & Docker Compose Setup (Port 3002)

Comprehensive Docker containerization enabling one-command local startup (`docker compose up --build`) on your PC at `http://localhost:3002`, connecting seamlessly to your cloud MongoDB database with a multi-stage production build.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices:
> 1. **Port Mapping (`3002:3000`)**: The host machine maps port `3002` to the container's internal port `3000`. On your local PC, you will access the application at `http://localhost:3002`. The container keeps internal port 3000, ensuring complete compatibility with the codebase and environment constraints.
> 2. **Database Connectivity**: Docker Compose will use your existing cloud MongoDB Atlas cluster defined in `.env`, requiring no local database volume maintenance or manual seeding.
> 3. **Multi-Stage Build Architecture**: Stage 1 builds the React frontend into static assets (`frontend/build`); Stage 2 sets up the lightweight Node.js runtime and serves both backend API endpoints and frontend assets under one process.

- **Confirmed Decision 1**: Connect to existing cloud MongoDB database.
- **Confirmed Decision 2**: Map host port `3002` to container port `3000` via Docker Compose.
- **Confirmed Decision 3**: Multi-stage production build for one-command startup and minimal image size.

---

## 1. Overview & Core Concept

- **What It Delivers**: Production-ready containerization files (`Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `DOCKER_README.md`) allowing you to clone the repo or run it on any PC with Docker Desktop in a single command.
- **Target Audience**: Plant engineers and developers running the Dharaksha portal locally or deploying on factory premises.
- **Key Value**: Zero dependency conflicts, no manual Node version matching or global package installations needed on your host machine.

---

## 2. User Experience & Local Workflow

- **Startup Command**: Open a terminal in the project directory and run:
  ```bash
  docker compose up --build
  ```
- **Accessing the App**: Navigate to `http://localhost:3002` in your local browser.
- **Shutdown Command**: Press `Ctrl+C` or run `docker compose down`.
- **Environment Management**: Docker Compose automatically loads `.env` so keys like `DB_URL`, `JWT_SECRET`, and `AES_SECRET` are passed into the container runtime.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Multi-Stage Production Build vs. Dev Hot-Reload**
  - *Chosen Approach*: Multi-stage `Dockerfile` using `node:20-alpine`. Stage 1 compiles the React frontend; Stage 2 packages Node production dependencies and static output.
  - *Why*: Reduces final container image size by up to 80% (omitting devDependencies and npm cache), speeds up container startup, and prevents port collision issues between CRA dev server and Express.
  - *Alternatives Considered*: Running two separate containers with volume mounts; rejected per confirmed user preference for a single self-contained production container.

- **Decision 2: Port Strategy**
  - *Chosen Approach*: Host port `3002` mapped to container `3000` (`3002:3000`).
  - *Why*: Solves the host collision (host port 3000 being used by another application) without modifying any internal application logic or hardcoded network listeners.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Host PC (Your Machine)                      │
│                                                             │
│   Web Browser  ──────►  http://localhost:3002               │
└─────────────────────────────────┬───────────────────────────┘
                                  │ Port Mapping (3002 -> 3000)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│             Docker Container (dharaksha-app)                │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Express Server (Port 3000)                         │   │
│   │                                                     │   │
│   │  • /api/v1/*, /api/v2s/*  ──► REST Endpoints        │   │
│   │  • /*                     ──► Serves frontend/build │   │
│   └──────────────────────────────┬──────────────────────┘   │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│          Cloud MongoDB Atlas (Remote Cluster)               │
│                                                             │
│   • Connection String: DB_URL loaded from .env              │
└─────────────────────────────────────────────────────────────┘
```

### Files to Create

1. **`Dockerfile`**:
   - Multi-stage build (Builder stage compiles frontend, Runner stage runs server).
   - Base image: `node:20-alpine`.
   - Exposes container port `3000`.
2. **`docker-compose.yml`**:
   - Defines `app` service.
   - Maps ports: `"3002:3000"`.
   - Injects `.env`.
   - Includes container healthcheck and restart policy (`unless-stopped`).
3. **`.dockerignore`**:
   - Excludes `node_modules`, `.git`, `.env.local`, build caches, and test coverage to optimize Docker build speed.
4. **`DOCKER_README.md`**:
   - Quick-start guide with exact commands, verification steps, and port troubleshooting instructions.

---

## 5. Verification Plan

1. Verify `Dockerfile`, `docker-compose.yml`, and `.dockerignore` file syntax and valid structure.
2. Ensure current dev server remains intact on port 3000 in AI Studio while Docker files are prepared for local deployment.
