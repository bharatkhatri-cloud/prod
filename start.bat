@echo off
echo ========================================================
echo       Starting Dharaksha Manufacturing Portal
echo ========================================================

REM Check if .env exists, if not create from .env.example
if not exist .env (
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

echo Building and starting Docker container on http://localhost:3002 ...
docker compose up --build -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  Success! Dharaksha Portal is up and running.
    echo  Open your browser to: http://localhost:3002
    echo ========================================================
) else (
    echo.
    echo [ERROR] Docker command encountered an issue.
    echo Please verify that Docker Desktop is running on your PC.
)

pause
