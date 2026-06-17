#!/bin/bash
# 🚀 EverActive Physiotherapy - Project Setup Script
# Run this script to properly setup the project for development or deployment

echo "🔧 EverActive Physiotherapy - Project Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Kill any existing Node processes on ports 5000, 5003, 5173
echo "🛑 Stopping any existing Node processes..."
lsof -i :5003 -sTCP:LISTEN -t >/dev/null 2>&1 && kill -9 $(lsof -i :5003 -sTCP:LISTEN -t) 2>/dev/null
lsof -i :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && kill -9 $(lsof -i :5173 -sTCP:LISTEN -t) 2>/dev/null
echo "✅ Ports cleared"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend || exit 1

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Created .env from .env.example - Please update with your values!"
    else
        echo "❌ No .env.example found in backend directory"
        exit 1
    fi
else
    echo "✅ Backend .env already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

cd ..
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend || exit 1

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "ℹ️  Frontend .env created (can usually stay as default)"
    fi
else
    echo "✅ Frontend .env already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..
echo ""

# Setup API (Vercel)
echo "📦 Setting up API (Vercel Serverless)..."
cd api || exit 1

if [ ! -d "node_modules" ]; then
    echo "📥 Installing API dependencies..."
    npm install
else
    echo "✅ API dependencies already installed"
fi

cd ..
echo ""

# Display next steps
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Review and update backend/.env with your actual values:"
echo "   - MONGO_URI: MongoDB Atlas connection string"
echo "   - JWT_SECRET: Your secure JWT secret"
echo "   - SMTP_USER/SMTP_PASS: Gmail credentials (app password)"
echo "   - ADMIN_EMAIL/ADMIN_PASSWORD: Admin account credentials"
echo "   - OPENROUTER_API_KEY: OpenRouter API key for AI chat"
echo ""
echo "2. Start development servers:"
echo "   Terminal 1: cd backend && npm start"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "3. Test in browser:"
echo "   http://localhost:5173"
echo ""
echo "4. For production (Vercel):"
echo "   - Push to GitHub"
echo "   - Set environment variables in Vercel dashboard"
echo "   - Vercel auto-deploys"
echo ""
