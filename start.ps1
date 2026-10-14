Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting Dharaksha Manufacturing Portal          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check if .env exists, if not copy from .env.example
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    }
}

Write-Host "Building and launching Docker container on http://localhost:3002 ..." -ForegroundColor Green
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  Success! Dharaksha Portal is up and running." -ForegroundColor Green
    Write-Host "  Open your browser to: http://localhost:3002" -ForegroundColor Yellow
    Write-Host "========================================================`n" -ForegroundColor Cyan
} else {
    Write-Host "`n[ERROR] Docker failed to start. Please verify Docker Desktop is running.`n" -ForegroundColor Red
}
