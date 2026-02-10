@echo off
cls
echo ================================================================
echo         LMS ENTERPRISE SYSTEM - FRESH START
echo ================================================================
echo.

REM Step 1: Clean up test files
echo [1/5] Cleaning up temporary files...
del /Q test_backend.py simple_test.py restart_backend.bat 2>nul

REM Step 2: Kill existing servers
echo [2/5] Stopping existing servers...
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :8000') DO TaskKill.exe /F /PID %%P 2>nul
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :3000') DO TaskKill.exe /F /PID %%P 2>nul
timeout /t 2 >nul

REM Step 3: Start Backend
echo [3/5] Starting Backend Server (Port 8000)...
cd backend
start "LMS Backend" cmd /k "python manage.py runserver"
cd ..
timeout /t 5

REM Step 4: Start Frontend
echo [4/5] Starting Frontend Application (Port 3000)...
cd frontend
start "LMS Frontend" cmd /k "npm run dev"
cd ..
timeout /t 3

REM Step 5: Instructions
echo [5/5] System Started!
echo.
echo ================================================================
echo IMPORTANT: CLEAR YOUR BROWSER CACHE
echo ================================================================
echo.
echo To fix the 404 error, you MUST clear cached tokens:
echo.
echo Option 1 (Recommended): Open Browser Console and run:
echo   localStorage.clear(); location.reload();
echo.
echo Option 2: Clear browser cache/cookies for localhost
echo.
echo Then login with:
echo   Learner: aravind / aravind123
echo   Manager: manager / manager123
echo.
echo System URL: http://localhost:3000
echo ================================================================
pause
