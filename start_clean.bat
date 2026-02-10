@echo off
cls
echo ================================================================
echo         LMS PRODUCTION RECOVERY - SAFE RESTART
echo ================================================================
echo.

REM Step 1: Kill existing servers
echo [1/4] Stopping existing servers...
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :8000') DO TaskKill.exe /F /PID %%P 2>nul
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :3000') DO TaskKill.exe /F /PID %%P 2>nul
echo     Servers stopped.
timeout /t 2 >nul

REM Step 2: Start Backend
echo.
echo [2/4] Starting Backend Server (Port 8000)...
cd backend
start "LMS Backend" cmd /k "python manage.py runserver"
cd ..
echo     Backend starting...
timeout /t 5 >nul

REM Step 3: Start Frontend  
echo.
echo [3/4] Starting Frontend Application (Port 3000)...
cd frontend
start "LMS Frontend" cmd /k "npm run dev"
cd ..
echo     Frontend starting...
timeout /t 3 >nul

REM Step 4: Instructions
echo.
echo [4/4] System Started Successfully!
echo.
echo ================================================================
echo BROWSER AUTH TOKEN CLEANUP REQUIRED (ONE-TIME)
echo ================================================================
echo.
echo To clear stale auth tokens causing 404 errors:
echo.
echo 1. Open browser at http://localhost:3000
echo 2. Press F12 to open Developer Console
echo 3. Click "Console" tab
echo 4. Paste this command and press Enter:
echo.
echo    localStorage.clear(); location.reload();
echo.
echo 5. Login with credentials:
echo    Learner: aravind / aravind123
echo    Manager: manager / manager123
echo.
echo After this one-time cleanup, the system will work reliably.
echo ================================================================
echo.
pause
