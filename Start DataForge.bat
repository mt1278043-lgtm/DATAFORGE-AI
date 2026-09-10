@echo off
rem Starts the DataForge AI development server (no browser is opened).
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies for the first time...
  call npm install
)
if not exist .env.local copy .env.example .env.local >nul
echo Dev server starting - open http://localhost:3000 yourself when it is ready.
call npm run dev
pause
