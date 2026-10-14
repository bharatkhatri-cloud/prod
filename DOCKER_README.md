# Running Dharaksha Portal with Docker

This guide explains how to start the Dharaksha manufacturing portal on your local PC using Docker on port **3002**.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS) or Docker Engine + Docker Compose Plugin (Linux).
- Ensure Docker is running on your machine.

---

## Quick Start (1 Command)

1. **Verify your `.env` file**:
   Ensure you have a `.env` file in the project root containing your cloud MongoDB connection string:
   ```env
   DB_URL=mongodb+srv://...
   JWT_SECRET=your_jwt_secret
   AES_SECRET=dharaksha_hashing-123
   ```
   *(A pre-configured `.env` is already present in this project).*

2. **Start the application**:
   Open a terminal in the project root directory and run:
   ```bash
   docker compose up --build -d
   ```

3. **Open the portal in your browser**:
   Navigate to:
   👉 **`http://localhost:3002`**

---

## Helpful Commands

| Action | Command |
|---|---|
| **View live logs** | `docker compose logs -f` |
| **Check container status** | `docker compose ps` |
| **Stop the application** | `docker compose down` |
| **Restart container** | `docker compose restart` |
| **Rebuild after code changes** | `docker compose up --build -d` |

---

## Port Configuration Explanation

- **Host Port**: `3002` (on your computer, avoiding conflicts with any service on port 3000).
- **Container Port**: `3000` (internal port used by the Express backend).
- The mapping in `docker-compose.yml` (`"3002:3000"`) directs traffic from `http://localhost:3002` on your machine into the container's production server.
