@echo off
echo =========================================================
echo Launching UPS Logistics Operations Intelligence Platform...
echo =========================================================
cd /d "%~dp0"
start "UPS Backend (FastAPI)" cmd /c "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "UPS Frontend (Next.js)" cmd /c "%~dp0run_frontend.bat"
echo.
echo Both servers initiated!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo =========================================================
