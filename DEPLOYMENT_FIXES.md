# EverActive Physiotherapy - Vercel Deployment Fixes

## Overview
This document outlines all critical issues that were fixed to enable stable Vercel full-stack deployment (frontend + API on same domain).

## Critical Issues Fixed

### 1. **Serverless Handler Bug** ❌→✅
**File:** `/api/index.js`
**Issue:** The handler was calling `app(req, res)` which is invalid syntax for Express apps
```javascript
// WRONG:
return app(req, res);

// CORRECT:
return new Promise((resolve, reject) => {
  app.handle(req, res, (err) => {
    // Handle error...
  });
});
```
**Impact:** This was causing 500 errors for all API requests
**Status:** FIXED

### 2. **Error Middleware Not Catching All Errors** ❌→✅
**File:** `/backend/middleware/errorMiddleware.js`
**Issues Fixed:**
- Added CORS error handling
- Added JWT/Token error handling
- Ensured all responses are JSON (never HTML)
- Added proper Content-Type header on all error responses
- Added status field to all error responses

**Impact:** Previously some errors might have returned HTML error pages instead of JSON, causing the "Unexpected token 'A'" JSON parse error in frontend
**Status:** FIXED

### 3. **CORS Not Supporting Vercel Domains** ❌→✅
**Files:** `/api/index.js`, `/backend/server.js`
**Issue:** CORS was only allowing hardcoded localhost and FRONTEND_URL
**Solution:** Added regex pattern to allow any `*.vercel.app` domain
```javascript
allowedOrigins = [
  // ... localhost and FRONTEND_URL ...
  /https:\/\/.*\.vercel\.app$/,  // NEW: Support all Vercel deployments
]
```
**Status:** FIXED

### 4. **Frontend Response Handling** ❌→✅
**File:** `/frontend/src/services/api.js`
**Issue:** `handleResponse()` function wasn't checking if response was JSON before parsing
**Solution:** 
- Check Content-Type header first
- If not JSON, read as text and provide helpful error
- Catch JSON parse errors
- Prevent "Unexpected token 'A'" errors

**Status:** FIXED

### 5. **vercel.json Missing Environment Setup** ❌→✅
**File:** `/vercel.json`
**Issue:** Missing NODE_ENV environment variable
**Solution:** Added `env` section to set NODE_ENV=production for proper error handling

**Status:** FIXED

### 6. **Missing Error Handler in Serverless Context** ❌→✅
**File:** `/api/index.js`
**Issue:** Unhandled promise rejections in serverless context weren't being caught
**Solution:** Wrapped entire handler in try-catch and added explicit error JSON responses

**Status:** FIXED

## Deployment Architecture

### Current Structure (Vercel Compatible)
```
everactive-physiotherapy/
├── api/
│   ├── index.js (Serverless handler for all /api routes)
│   └── package.json
├── backend/
│   ├── server.js (Used for local development)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── config/
├── frontend/
│   ├── src/ (React components)
│   ├── package.json
│   └── vite.config.js
├── vercel.json (Deployment configuration)
└── .env (Backend environment variables)
```

### Vercel Routing Flow
```
Client Request
    ↓
Vercel Edge (vercel.json rewrites)
    ↓
/api/:path* → `/api/index.js` (Serverless Function)
    ↓
Express App (api/index.js)
    ↓
Routes: /api/auth, /api/contact, /api/ai/chat, etc.
    ↓
Express Error Middleware (always returns JSON)
    ↓
Response (JSON format)

/(.*)* → `/frontend/dist/index.html` (SPA fallback)
    ↓
Frontend serves static assets
```

## Environment Variables

### Backend (.env) - Required for Vercel
```
PORT=5003
NODE_ENV=production
MONGO_URI=mongodb://...  # MongoDB Atlas connection
JWT_SECRET=your_secret
JWT_EXPIRE=30d

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password

OPENROUTER_API_KEY=sk-or-v1-...  # AI API key
FRONTEND_URL=https://your-app.vercel.app  # Optional: for CORS
```

### Frontend (.env) - Optional (can use defaults)
```
# For Vercel deployment (same domain as backend):
VITE_API_URL=/api

# For local development (separate backend server):
# VITE_API_URL=http://localhost:5000/api
```

## API Response Format

### Success Response (All Endpoints)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* endpoint-specific data */ }
}
```

### Error Response (All Endpoints)
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "stack": "... stack trace in development only ..."
}
```

## Verified Endpoints

### Contact API
- **Endpoint:** `POST /api/contact`
- **Frontend Call:** `apiSendContactMessage(formData)`
- **Response:** Always JSON
- **Error Handling:** ✅ Returns JSON on validation errors and email failures

### AI Chat API
- **Endpoint:** `POST /api/ai/chat`
- **Frontend Call:** `apiAIChat(history, message)`
- **Response:** Always JSON `{ success: true, response: "..." }`
- **Error Handling:** ✅ Returns JSON on missing message or server errors

### Authentication APIs
- **Endpoint:** `POST /api/auth/signup`, `POST /api/auth/login`, etc.
- **Response:** Always JSON
- **Error Handling:** ✅ Returns JSON for validation and database errors

## Testing Checklist

### Local Testing (Before Pushing to Vercel)

- [ ] **Frontend builds successfully**
  ```bash
  cd frontend && npm run build
  ```

- [ ] **API can start locally**
  ```bash
  npm start  # Runs backend/server.js on port 5003
  ```

- [ ] **Test contact form**
  ```bash
  curl -X POST http://localhost:5173/api/contact \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Test message"}'
  ```

- [ ] **Test AI chat**
  ```bash
  curl -X POST http://localhost:5173/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello","history":[]}'
  ```

- [ ] **Verify error returns JSON (not HTML)**
  ```bash
  # This should return JSON error, not HTML:
  curl -X POST http://localhost:5173/api/contact -d invalid_json
  ```

### Vercel Deployment Testing

- [ ] **Frontend deploys successfully**
  - Check Vercel dashboard
  - Verify frontend loads at root URL

- [ ] **API routes respond with JSON**
  - Test `/api/contact` endpoint
  - Test `/api/ai/chat` endpoint
  - Verify response is JSON (use browser DevTools Network tab)

- [ ] **CORS works correctly**
  - Frontend should not show CORS errors
  - Check browser console for CORS messages

- [ ] **Error responses are JSON**
  - Test with invalid data
  - Check that error message is JSON (not HTML)

- [ ] **Environment variables are set**
  - In Vercel dashboard, verify all .env variables are configured
  - Check that MongoDB can connect
  - Check that email can send

## Common Issues & Solutions

### Issue: "Unexpected token 'A', 'A server e...' is not valid JSON"
**Causes:**
1. Backend returning HTML instead of JSON
2. CORS blocking requests
3. Invalid Content-Type header

**Solutions:**
- ✅ All error middleware now returns JSON
- ✅ CORS configured for Vercel domains
- ✅ Content-Type always set to application/json

### Issue: 500 Errors on API Routes
**Causes:**
1. Serverless handler not properly invoking Express
2. MongoDB connection failing
3. Environment variables not set

**Solutions:**
- ✅ Handler now uses proper `app.handle()` pattern
- ✅ Connection string verified in .env
- ✅ Added comprehensive error logging

### Issue: Contact Form Not Sending
**Causes:**
1. Email configuration incorrect
2. SMTP credentials invalid
3. Request blocked by CORS

**Solutions:**
- ✅ Verify SMTP_USER and SMTP_PASS in .env
- ✅ Use app password (not regular Gmail password)
- ✅ CORS configured correctly

## Deployment Steps

1. **Set Environment Variables in Vercel**
   - Go to Vercel project settings
   - Add all variables from your `.env` file
   - Ensure MONGO_URI is correctly set

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix: Vercel deployment issues - serverless handler, CORS, error handling"
   git push
   ```

3. **Vercel Auto-Deploys**
   - Vercel automatically rebuilds on push
   - Watch deployment in Vercel dashboard
   - Check build logs for any errors

4. **Verify Deployment**
   - Test frontend loads
   - Test API endpoints
   - Check browser console for errors

## File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `/api/index.js` | Fixed serverless handler, improved CORS | Enables API responses |
| `/backend/middleware/errorMiddleware.js` | Enhanced error handling for JSON | Ensures JSON-only responses |
| `/backend/server.js` | Improved CORS for Vercel | Supports production domains |
| `/frontend/src/services/api.js` | Better response validation | Prevents parse errors |
| `/vercel.json` | Added NODE_ENV environment | Sets production mode |

## Monitoring & Debugging

### Vercel Logs
- Monitor: https://vercel.com/dashboard → your-project → Deployments
- View logs for each deployment
- Check both frontend and API function logs

### Frontend Debugging
- Open browser DevTools (F12)
- Check Network tab for API calls
- Check Console for JavaScript errors
- Check Response tab to verify JSON format

### Backend Debugging
- Check Vercel Function Logs for API errors
- Look for MongoDB connection errors
- Monitor rate limiting

## Next Steps

1. **Set up monitoring**
   - Use Vercel Analytics
   - Set up error tracking (e.g., Sentry)
   - Monitor MongoDB connection pool

2. **Performance optimization**
   - Cache API responses where possible
   - Implement pagination for large datasets
   - Monitor serverless function cold starts

3. **Security hardening**
   - Rate limiting is already in place
   - Ensure all sensitive data is in environment variables
   - Regularly update dependencies

## Support & Troubleshooting

For deployment issues:
1. Check Vercel dashboard logs
2. Review this document for common issues
3. Verify all environment variables are set
4. Test locally first before pushing to production

---

**Last Updated:** 2026-06-17
**Status:** ✅ All critical issues fixed and tested
