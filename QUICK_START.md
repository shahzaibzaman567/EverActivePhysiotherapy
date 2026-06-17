# 🚀 Quick Start Guide

## 5-Minute Setup (First Time)

### Windows Users
1. **Extract project folder**
2. **Double-click `setup.bat`**
3. **Wait for completion**
4. **Update `backend\.env` with your credentials**

### macOS/Linux Users
```bash
chmod +x setup.sh
./setup.sh
# Update backend/.env with your credentials
```

### All Users - After Setup
**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# Should print: ✅ Server running on port 5003
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# Should print: ✅ Local: http://localhost:5173
```

**Browser:**
- Visit `http://localhost:5173`
- Test features

## What You Need (Prerequisites)

- ✅ Node.js v18+ (download from nodejs.org)
- ✅ Git (for version control)
- ✅ MongoDB Atlas account (free tier available)
- ✅ Gmail account with 2FA enabled
- ✅ OpenRouter account (free tier available)
- ✅ Vercel account (for deployment)

## 📦 What Gets Installed

When you run `setup.sh` or `setup.bat`, the script:

1. **Checks Node.js** - Ensures you have Node.js installed
2. **Kills existing processes** - Clears ports 5003 and 5173
3. **Sets up Backend**
   - Creates `.env` from `.env.example`
   - Installs npm packages
   - Ready to connect to MongoDB

4. **Sets up Frontend**
   - Creates `.env` if needed
   - Installs npm packages
   - Ready to develop

5. **Sets up API** (Vercel)
   - Installs npm packages for serverless functions

## 🔐 Setting Up Environment Variables

### Step 1: Get Your Credentials

**MongoDB Atlas (Database):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free
3. Create a cluster
4. Get your connection string
5. Copy to `backend/.env` as `MONGO_URI`

**Gmail (Email):**
1. Enable 2-Factor Authentication
2. Go to https://myaccount.google.com/apppasswords
3. Create app password for Mail
4. Copy to `backend/.env` as `SMTP_PASS`

**OpenRouter (AI Chat):**
1. Go to https://openrouter.ai
2. Create account
3. Get API key
4. Copy to `backend/.env` as `OPENROUTER_API_KEY`

### Step 2: Update backend/.env

After setup, edit `backend/.env`:

```bash
# Windows - Use Notepad or VS Code
# Navigate to backend folder
# Open .env file and edit

# macOS/Linux
nano backend/.env
```

Update these lines with YOUR values:
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=generate-a-random-32-char-string
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-with-spaces
ADMIN_EMAIL=your-email@gmail.com
ADMIN_PASSWORD=secure-password-you-create
OPENROUTER_API_KEY=sk-or-v1-your-key
```

**DON'T share this file!** ⚠️

## ✅ Testing Everything Works

### Test Backend
```bash
curl http://localhost:5003
# Should return: {"message": "Welcome to EverActive..."}
```

### Test Contact API
```bash
curl -X POST http://localhost:5003/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "service": "General",
    "message": "Test message"
  }'
# Should return: {"success": true, "message": "..."}
```

### Test AI Chat API
```bash
curl -X POST http://localhost:5003/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
# Should return: {"success": true, "response": "..."}
```

### Test Frontend in Browser
1. Open http://localhost:5173
2. Navigate around pages
3. Check browser console (F12) for errors
4. Test forms:
   - Contact form
   - AI chat
   - Sign up (if not logged in)
   - Login

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Initial commit: EverActive Physiotherapy"
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Add Environment Variables
In Vercel project settings:
1. Go to "Settings" → "Environment Variables"
2. Add all variables from your `backend/.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `OPENROUTER_API_KEY`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-vercel-domain.vercel.app`

### Step 4: Deploy
Click "Deploy" - Vercel handles everything!

### Step 5: Test Live Site
1. Visit your Vercel URL
2. Test all features
3. Check browser console for errors

## 📚 Project Files Explained

| File | Purpose |
|------|---------|
| `backend/server.js` | Express.js server for local development |
| `api/index.js` | Vercel serverless function (production) |
| `frontend/src/main.jsx` | React app entry point |
| `vercel.json` | Vercel deployment configuration |
| `backend/.env` | ⚠️ Secrets (NEVER commit) |
| `backend/.env.example` | Template (safe to commit) |
| `.gitignore` | Tells git what NOT to commit |

## 🐛 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Port 5003 already in use | `setup.bat` or restart computer |
| `.env` file not found | Run `setup.bat` (creates from template) |
| MongoDB connection failed | Check MONGO_URI in `.env` |
| Email not sending | Check SMTP_USER/PASS are correct |
| AI chat not responding | Check OPENROUTER_API_KEY is set |
| "Unexpected token" error | Backend is returning HTML instead of JSON |
| CORS error | Check FRONTEND_URL matches your domain |

## 📱 Features to Test

- [ ] **Authentication**
  - [ ] Sign up with email
  - [ ] Log in
  - [ ] Log out
  - [ ] Forgot password

- [ ] **Appointments**
  - [ ] Browse doctors
  - [ ] Book appointment
  - [ ] View my appointments
  - [ ] Reschedule appointment

- [ ] **Contact Form**
  - [ ] Submit contact form
  - [ ] Check email received

- [ ] **AI Chat**
  - [ ] Open chat widget
  - [ ] Send message
  - [ ] Get response

- [ ] **Reviews**
  - [ ] View reviews
  - [ ] Submit review

- [ ] **Admin Panel** (if you're admin)
  - [ ] View dashboard
  - [ ] Manage users
  - [ ] View audit logs

## 🆘 Getting Help

1. **Check error messages** - They're usually very helpful!
2. **Check browser console** - Press F12, click "Console" tab
3. **Check terminal output** - Where you ran `npm start`
4. **Read documentation files**:
   - `SECURITY_GUIDE.md` - Security setup
   - `DEPLOYMENT_FIXES.md` - Technical details
   - `DEPLOYMENT_READY.md` - Production guide

## 🎉 You're All Set!

Your project is now:
- ✅ Properly secured (secrets protected)
- ✅ Properly structured (organized code)
- ✅ Ready to develop (all dependencies installed)
- ✅ Ready to deploy (Vercel configured)

**Next steps:**
1. Start coding!
2. Test locally
3. Deploy to Vercel when ready
4. Monitor your live site

---

**Pro Tips:**
- Always run `setup.bat` first time to get started
- Keep terminal windows open to watch for errors
- Test locally before pushing to GitHub
- Monitor Vercel dashboard for deployment status

**Happy coding! 🚀**
