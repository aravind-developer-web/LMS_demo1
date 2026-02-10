@echo off
echo ========================================================
echo        STARTING LMS ENTERPRISE SYSTEM (PORT 3000)
echo ========================================================

echo [1/3] Starting Backend Server (Port 8000)...
start "LMS Backend" cmd /k "cd backend && python manage.py runserver"

echo [2/3] Waiting for Backend to Initialize...
timeout /t 5

echo [3/3] Starting Frontend Application (Port 3000)...
start "LMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo        SYSTEM LIVE AT http://localhost:3000
echo ========================================================
echo.
echo Login with:
echo   Learner: aravind / aravind123
echo   Manager: manager / manager123
echo.
pause
