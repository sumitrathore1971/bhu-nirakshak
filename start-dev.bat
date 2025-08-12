@echo off
echo Starting Bhu-Nirakshak Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd client1 && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173
start http://localhost:8080

echo.
echo Both servers are now running!
echo Close the command windows to stop the servers.
