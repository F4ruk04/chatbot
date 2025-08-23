@echo off
echo Starting backend and frontend servers...

REM Start backend server in a new window
start "Backend Server" /D "backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Start frontend server in a new window
start "Frontend Server" /D "frontend" cmd /k "npm run dev"

echo Both servers started. Press any key to exit.
pause >nul