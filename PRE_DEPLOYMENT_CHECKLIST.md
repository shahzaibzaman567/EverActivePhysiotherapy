# Pre-Deployment Checklist

## Before Each Deployment to Vercel

### Step 1: Verify Environment Setup ✓
- [ ] `.env` file has all required variables:
  - `MONGO_URI` - MongoDB connection string
  - `JWT_SECRET` - JWT signing key
  - `SMTP_USER` and `SMTP_PASS` - Email credentials
  - `ADMIN_EMAIL` and `ADMIN_PASSWORD` - Admin account
  - `OPENROUTER_API_KEY` - AI API key (if using AI features)
  - `FRONTEND_URL` - (optional) for CORS

### Step 2: Local Testing ✓
- [ ] Frontend builds without errors
  ```bash
  cd frontend && npm run build
  ```
- [ ] Backend starts locally
  ```bash
  cd backend && npm start
  ```
- [ ] API endpoints respond with JSON (not HTML)
  ```bash
  # Test contact endpoint
  curl -X POST http://localhost:5000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"test@example.com","service":"General","message":"Test"}'
  ```
- [ ] Error responses are valid JSON
- [ ] No console errors or warnings in browser
- [ ] Contact form submission works
- [ ] AI chat works

### Step 3: Vercel Configuration ✓
- [ ] All `.env` variables are added to Vercel project settings
- [ ] `vercel.json` exists and is properly configured
- [ ] Build command: `cd frontend && npm install && npm run build`
- [ ] Install command: `npm install`
- [ ] Output directory: `frontend/dist`

### Step 4: Code Quality ✓
- [ ] No console.log statements left in production code (or wrapped in dev check)
- [ ] No hardcoded URLs (use environment variables)
- [ ] No security secrets in code (use .env)
- [ ] All error handlers return JSON

### Step 5: Git Commit ✓
- [ ] All files are committed (no pending changes)
- [ ] Commit message is descriptive
- [ ] Branch is up to date with main

### Step 6: Push & Deploy ✓
- [ ] Push to GitHub
  ```bash
  git push origin main
  ```
- [ ] Watch Vercel deployment in dashboard
- [ ] Wait for "Deployment successful"

### Step 7: Post-Deployment Verification ✓
- [ ] Frontend loads at root URL
- [ ] Can navigate to all pages
- [ ] Contact form works:
  - [ ] Can submit form
  - [ ] Receives success message
  - [ ] Email is sent to admin
- [ ] AI chat works:
  - [ ] Can open chat
  - [ ] Can send message
  - [ ] Receives response
- [ ] Authentication works:
  - [ ] Can sign up
  - [ ] Can log in
  - [ ] Can log out
- [ ] Browser console has no errors
- [ ] Network tab shows all API responses are JSON
- [ ] No CORS errors in browser console

## Emergency Rollback

If deployment breaks production:

1. **Identify the issue:**
   ```
   Check Vercel dashboard logs
   Check browser DevTools Network tab
   Check error messages
   ```

2. **Quick fix options:**
   ```bash
   # Revert to previous deployment in Vercel dashboard
   # Or revert commit and push new fix
   git revert HEAD
   git push
   ```

3. **Contact Firebase/Database Provider:**
   - Ensure MongoDB is accessible
   - Check quota limits
   - Verify connection string

## Performance Checklist

- [ ] Check Vercel Analytics for:
  - Response times (should be <1s for most endpoints)
  - Error rates (should be <1%)
  - Function execution time (should be <500ms for most endpoints)
- [ ] Monitor MongoDB connection pool
- [ ] Check rate limiting logs

## Security Checklist

- [ ] All sensitive data is in environment variables
- [ ] No API keys exposed in frontend code
- [ ] CORS is properly configured (not allowing *)
- [ ] Rate limiting is active on auth and contact endpoints
- [ ] JWT tokens have proper expiration

## Common Issues Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "Unexpected token 'A'" error | Check that API returns JSON, not HTML. Verify Content-Type header. |
| 500 error on /api/contact | Check SMTP credentials, verify MongoDB connection |
| 500 error on /api/ai/chat | Check OPENROUTER_API_KEY is set, verify message is provided |
| CORS error in browser | Check CORS origin in api/index.js, add domain to allowedOrigins |
| Contact form doesn't send | Check SMTP_USER/SMTP_PASS, verify email configuration |
| Frontend shows old version | Hard refresh browser (Ctrl+Shift+R), clear browser cache |

## After Successful Deployment

- [ ] Test all features one more time
- [ ] Monitor Vercel dashboard for errors over next 24 hours
- [ ] Check email notifications for any errors
- [ ] Document any issues encountered
- [ ] Update team on deployment status

---

**Pro Tips:**
- Keep this checklist in your terminal or bookmark it
- Run through it before every deployment
- Set aside 15 minutes for testing after each deployment
- Monitor first 24 hours after deployment carefully

**Estimated Time:** 15-20 minutes per deployment
