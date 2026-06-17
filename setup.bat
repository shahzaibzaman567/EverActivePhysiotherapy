@echo off
REM 🚀 EverActive Physiotherapy - Project Setup Script (Windows)
REM Run this script to properly setup the project

echo.
echo 🔧 EverActive Physiotherapy - Project Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Kill any existing Node processes
echo 🛑 Stopping any existing Node processes...
tasklist | find /i "node.exe" >nul
if not errorlevel 1 (
    taskkill /IM node.exe /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo ✅ Processes cleared
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ⚠️  Created .env from .env.example - Please update with your values!
    ) else (
        echo ❌ No .env.example found
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend .env already exists
)

if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    call npm install
) else (
    echo ✅ Backend dependencies already installed
)
cd ..
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ℹ️  Frontend .env created
    )
) else (
    echo ✅ Frontend .env already exists
)

if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    call npm install
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..
echo.

REM Setup API
echo 📦 Setting up API (Vercel Serverless)...
cd api
if not exist "node_modules" (
    echo 📥 Installing API dependencies...
    call npm install
) else (
    echo ✅ API dependencies already installed
)
cd ..
echo.

REM Display next steps
echo ✅ Setup Complete!
echo.
echo 📝 Next Steps:
echo 1. Review and update backend\.env with your actual values:
echo    - MONGO_URI: MongoDB Atlas connection string
echo    - JWT_SECRET: Your secure JWT secret
echo    - SMTP_USER/SMTP_PASS: Gmail credentials (app password)
echo    - ADMIN_EMAIL/ADMIN_PASSWORD: Admin account credentials
echo    - OPENROUTER_API_KEY: OpenRouter API key for AI chat
echo.
echo 2. Start development servers:
echo    Terminal 1: cd backend ^&^& npm start
echo    Terminal 2: cd frontend ^&^& npm run dev
echo.
echo 3. Test in browser:
echo    http://localhost:5173
echo.
echo 4. For production (Vercel):
echo    - Push to GitHub
echo    - Set environment variables in Vercel dashboard
echo    - Vercel auto-deploys
echo.
pause
