@echo off
echo =========================================================
echo Starting UPS Operations Intelligence FastAPI Backend...
echo =========================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
