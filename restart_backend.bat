@echo off
echo Restarting LMS Backend Server...
echo.

REM Kill any existing Django server on port 8000
echo [1/2] Stopping existing server...
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :8000') DO TaskKill.exe /F /PID %%P 2>nul

timeout /t 2

REM Start fresh server
echo [2/2] Starting new server...
cd backend
start "LMS Backend" cmd /k "python manage.py runserver"

echo.
echo Backend server restarted on port 8000
echo.
pause
