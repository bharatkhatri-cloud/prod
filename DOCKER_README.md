# Running Dharaksha Portal with Docker (Port 3002)

This setup runs the entire Dharaksha manufacturing portal inside Docker on host port **3002**, connecting to your cloud MongoDB database with zero local dependency conflicts.

---

## Quick Start on Windows

### Option 1: Double-Click (Easiest)
Simply double-click the **`start.bat`** file in your project folder. It will automatically initialize any missing config files and launch the Docker container.

### Option 2: Windows PowerShell
Open PowerShell in the project directory and run:
```powershell
.\start.ps1
```

### Option 3: Standard Docker Command
In any terminal (PowerShell, Command Prompt, or Linux bash):
```bash
docker compose up --build -d
```
> **Note**: Even if `.env` is absent on your PC, `docker-compose.yml` has embedded default environment variables and connects directly to your cloud MongoDB cluster out-of-the-box.

---

## Access the Application

Once started, open your web browser to:
👉 **`http://localhost:3002`**

---

## Helpful Commands

| Action | Command |
|---|---|
| **View live logs** | `docker compose logs -f` |
| **Check container status** | `docker compose ps` |
| **Stop container** | `docker compose down` |
| **Restart container** | `docker compose restart` |
| **Rebuild after updates** | `docker compose up --build -d` |

---

## Why Port 3002?

- Your PC has port `3000` allocated to another service.
- The `docker-compose.yml` configuration maps **`3002:3000`**, routing external traffic from your browser (`http://localhost:3002`) into the container's internal Express server port (`3000`).
