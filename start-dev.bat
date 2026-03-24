@echo off
echo ============================================
echo   Marketplace CB - Dev Environment
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI + SQLite)...
start "Backend - Marketplace CB" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Frontend (Next.js)...
start "Frontend - Marketplace CB" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/api/v1/docs
echo   Frontend: http://localhost:3000
echo ============================================
echo.
echo Ambos os servidores estao rodando em janelas separadas.
pause
