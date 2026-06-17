# 🔐 Security & Environment Setup Guide

## ⚠️ CRITICAL: Never Commit .env Files

Your project is **properly secured**:
- ✅ `.env` files are in `.gitignore`
- ✅ `.env` files are NOT in git history
- ✅ `backend/.env` contains sensitive credentials
- ✅ Environment variables are template-based (`.env.example`)

### Why This Matters
If `.env` is committed to GitHub, attackers can steal:
- MongoDB connection strings
- Admin passwords
- Email credentials
- API keys
- JWT secrets

## 📋 Project Structure

```
EverActivePhysiotherapy/
├── api/                       # Vercel serverless functions
│   ├── .env.example          # Template (no secrets)
│   ├── .gitignore            # Protects .env
│   └── index.js              # Serverless handler
│
├── backend/                   # Express.js server
│   ├── .env                  # ⚠️ NEVER COMMIT - Local only
│   ├── .env.example          # ✅ SAFE - Template only
│   ├── .gitignore            # Protects .env
│   ├── server.js
│   └── ...
│
├── frontend/                  # React.js app
│   ├── .env.example          # Template (no secrets)
│   └── ...
│
├── .gitignore                # Root-level protection
├── vercel.json               # Deployment config
└── setup.sh/setup.bat        # Setup automation
```

## 🔑 Environment Variables Guide

### Backend (.env) - Development

Create `backend/.env` with your actual values:

```bash
# Application
PORT=5003
NODE_ENV=development

# MongoDB Connection (Get from MongoDB Atlas)
MONGO_URI=mongodb://user:pass@cluster.mongodb.net:27017/?ssl=true&replicaSet=...

# JWT (Generate a random 32+ character string)
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars_long
JWT_EXPIRE=30d

# Gmail SMTP (Use App Password, not regular password)
# 1. Go to myaccount.google.com/apppasswords
# 2. Create app-specific password
# 3. Paste here (with spaces)
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Admin Account (Created on first startup)
ADMIN_EMAIL=your-email@gmail.com
ADMIN_PASSWORD=very_secure_admin_password

# AI API (Get from openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env) - Optional

Most defaults work fine. Only set if different:

```bash
# Usually leave as /api for same-domain deployment
VITE_API_URL=/api

# Or for separate backend server:
# VITE_API_URL=http://localhost:5000/api
```

### Vercel (Production Environment)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
MONGO_URI=<your-production-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
SMTP_USER=<gmail@gmail.com>
SMTP_PASS=<app-specific-password>
ADMIN_EMAIL=<admin@example.com>
ADMIN_PASSWORD=<secure-admin-password>
OPENROUTER_API_KEY=<your-api-key>
FRONTEND_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 🚀 Getting Your API Keys

### 1. MongoDB Atlas Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a cluster
4. Click "Connect"
5. Choose "Drivers"
6. Copy connection string
7. Replace `<password>` with your database password
8. Add to `backend/.env` as `MONGO_URI`

**Example:**
```
mongodb://shahzaibzaman465_db_user:PASSWORD@ac-pe3ljoi-shard-00-00.qlwkr1y.mongodb.net:27017/?ssl=true&replicaSet=...
```

### 2. Gmail SMTP Password (App Password)

1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate password
5. Copy the 16-character password with spaces
6. Paste into `backend/.env` as `SMTP_PASS`

**Example:**
```
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### 3. OpenRouter API Key (AI Chat)

1. Go to https://openrouter.ai
2. Sign up
3. Go to Settings → API Keys
4. Create new key
5. Copy and paste into `backend/.env` as `OPENROUTER_API_KEY`

**Example:**
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## ✅ Project Setup Checklist

### First Time Setup

- [ ] **Clone the repository**
  ```bash
  git clone <your-repo-url>
  cd EverActivePhysiotherapy
  ```

- [ ] **Run setup script**
  - Windows: Double-click `setup.bat`
  - macOS/Linux: `bash setup.sh`

- [ ] **Create backend/.env**
  ```bash
  cd backend
  cp .env.example .env
  # Edit with your actual values
  nano .env  # or use your editor
  ```

- [ ] **Verify .env is ignored**
  ```bash
  git status
  # Should NOT show backend/.env
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```

- [ ] **Test backend**
  ```bash
  npm start
  # Should print: Server running on port 5003
  ```

- [ ] **Test frontend** (new terminal)
  ```bash
  cd frontend
  npm run dev
  # Should print: Local: http://localhost:5173
  ```

### Before Each Deployment

- [ ] **Verify .env is not staged**
  ```bash
  git status
  # backend/.env should NOT be listed
  ```

- [ ] **Verify .gitignore has .env**
  ```bash
  cat .gitignore | grep ".env"
  # Should show: .env
  ```

- [ ] **Test all features locally**
  - Contact form
  - AI chat
  - Login/Signup
  - Doctor booking

- [ ] **Set Vercel environment variables**
  - Visit https://vercel.com/dashboard
  - Select your project
  - Go to Settings → Environment Variables
  - Add all variables from your local `.env`

- [ ] **Push to GitHub**
  ```bash
  git add -A
  git commit -m "Feature: Add new feature"
  git push origin main
  ```

- [ ] **Monitor Vercel deployment**
  - Check https://vercel.com/dashboard
  - Verify "Deployment successful"
  - Test live site

## 🔒 Security Best Practices

### DO ✅
- ✅ Use strong passwords (min 16 chars with symbols)
- ✅ Use app-specific passwords for Gmail (not regular password)
- ✅ Rotate API keys regularly
- ✅ Keep `.env` in `.gitignore`
- ✅ Use environment variables for all secrets
- ✅ Check `.gitignore` before committing
- ✅ Review files before committing with `git diff`
- ✅ Use HTTPS everywhere

### DON'T ❌
- ❌ Never commit `.env` files
- ❌ Never push API keys to GitHub
- ❌ Never share `.env` file with others
- ❌ Never use same password everywhere
- ❌ Never log secrets in console
- ❌ Never hardcode credentials in code
- ❌ Never disable CORS without reason
- ❌ Never use plain HTTP in production

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process using port 5003 (Windows)
netstat -ano | findstr :5003
taskkill /PID <PID> /F

# Kill process (macOS/Linux)
lsof -i :5003
kill -9 <PID>

# Or just use different port
PORT=5004 npm start
```

### MongoDB Connection Failed
```
❌ Error: connect ECONNREFUSED
```
- Check MONGO_URI in `.env`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas
- Ensure network access is enabled

### .env File Keeps Getting Committed
```bash
# Remove from git cache if already committed
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push
```

### API Keys Not Working
```
❌ Error: 401 Unauthorized
```
- Check key format (should start with `sk-or-v1-`)
- Verify key is not expired
- Ensure key is set in Vercel environment variables
- Test key in API service dashboard

## 📞 Support

For security concerns:
1. Check this guide
2. Review `.gitignore` configuration
3. Verify `.env` is not in git history: `git log --name-only`
4. Check Vercel environment variables are set
5. Review console logs for error messages

---

**Remember:** If `.env` is ever exposed, immediately rotate all credentials:
1. Change MongoDB password
2. Revoke and recreate API keys
3. Update Gmail app password
4. Force push new version with rotated credentials

**Security is not optional - it's essential!** 🔐
