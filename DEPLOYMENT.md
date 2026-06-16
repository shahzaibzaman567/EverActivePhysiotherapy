# 🚀 Vercel Deployment Guide

This guide explains how to deploy the EverActive Physiotherapy project to Vercel as a single monorepo deployment from the root directory.

## 📋 Prerequisites

- MongoDB Atlas account (free tier works)
- Gmail account (for email notifications) or SMTP server
- Google AI API key (for AI assistant feature)
- Vercel account (free tier works)
- GitHub account

## 🔧 Environment Variables Setup

### 1. MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist IP `0.0.0.0/0` (allows all IPs for Vercel)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/everactive_physio?retryWrites=true&w=majority`

### 2. Gmail Setup (for emails)
1. Enable 2-factor authentication on your Gmail
2. Generate an App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Use the 16-character app password as `EMAIL_PASSWORD`

### 3. Google AI Setup (for AI assistant)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key or use existing one
3. Note: The AI assistant has a rule-based fallback that works without an API key, but for full functionality, set up the key

### 4. Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/everactive_physio?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
ADMIN_EMAIL=your_admin_email@gmail.com
ADMIN_PASSWORD=your_secure_admin_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@everactivephysiotherapy.com
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_AI_API_KEY=your_google_ai_api_key
NODE_ENV=production
```

**Important:** Set all variables for both **Production**, **Preview**, and **Development** environments.

## 📦 Project Structure

```
EverActivePhysiotherapy/
├── api/                    # Vercel serverless functions
│   ├── index.js           # Express app wrapper
│   └── package.json       # Backend dependencies
├── backend/              # Original backend (reference)
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/             # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── vercel.json          # Vercel configuration
├── .env.example         # Environment variables template
└── DEPLOYMENT.md        # This file
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from root directory:
```bash
cd e:\projects\EverActivePhysiotherapy
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Set environment variables
   - Confirm deployment

### Option 2: Deploy via GitHub Integration

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/EverActivePhysiotherapy.git
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import from GitHub
5. Select `EverActivePhysiotherapy` repository
6. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
7. Add environment variables (see above)
8. Click "Deploy"

## 🔀 How It Works

### Frontend
- Built with Vite in `frontend/` directory
- Static files output to `frontend/dist`
- Served directly by Vercel
- Uses React Router for client-side routing

### Backend
- Express app wrapped as Vercel serverless function in `api/index.js`
- All `/api/*` requests routed to `api/index.js`
- Uses MongoDB Atlas for database
- Handles authentication, appointments, doctors, reviews, etc.

### Routing
- `/api/*` → Backend API (serverless function)
- `/` → Frontend (static files)
- All other routes → Frontend (SPA routing handled by React Router)

## 🧪 Testing After Deployment

1. **Frontend:** Visit your Vercel URL
2. **API Health:** Check `https://your-app.vercel.app/api/`
3. **Auth:** Test signup/login
4. **Database:** Verify data persists in MongoDB Atlas
5. **Email:** Test password reset (check email)
6. **AI Assistant:** Test chat functionality

## 🐛 Troubleshooting

### Build Errors
- Ensure `frontend/package.json` has all dependencies
- Check `npm install` runs successfully in frontend

### API Errors
- Verify MongoDB connection string is correct
- Check IP whitelist in MongoDB Atlas (0.0.0.0/0)
- Ensure all environment variables are set in Vercel

### CORS Errors
- Verify `FRONTEND_URL` matches your Vercel domain
- Check CORS configuration in `api/index.js`

### Email Not Working
- Verify Gmail app password is correct
- Check `EMAIL_USER` and `EMAIL_PASSWORD`
- Ensure 2-factor authentication is enabled

### Database Connection Issues
- Verify MongoDB cluster is running
- Check connection string format
- Ensure database user has correct permissions

## 🔄 Local Development

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Backend Only (requires MongoDB running locally)
```bash
cd backend
npm install
npm run dev
```

### Full Stack (recommended for development)
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Set `VITE_API_URL=http://localhost:5000/api` in frontend `.env`

## 📝 Notes

- The `backend/` directory is kept for reference and local development
- Production deployment uses `api/` directory for Vercel serverless functions
- MongoDB connection is established per request (serverless best practice)
- Admin account is auto-created on first deployment using environment variables

## 🔐 Security Best Practices

1. Never commit `.env` files to GitHub
2. Use strong, unique passwords for all services
3. Rotate JWT secrets regularly
4. Use environment-specific API keys
5. Enable MongoDB Atlas IP whitelisting
6. Monitor Vercel logs for suspicious activity

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

## 🎉 Success!

Your EverActive Physiotherapy platform is now live on Vercel with:
- ✅ Frontend and backend in single deployment
- ✅ Automatic API routing
- ✅ MongoDB database integration
- ✅ Email notifications
- ✅ AI assistant
- ✅ Secure authentication
- ✅ Admin dashboard
