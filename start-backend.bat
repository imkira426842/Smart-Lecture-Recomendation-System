@echo off
echo Starting LearnPilot AI Backend (FastAPI)...
echo.
cd /d "%~dp0backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
