# Vercel Environment Variables Setup

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add ALL of the following variables. Set environment to **Production** (and optionally Preview).

---

## Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/everactive_physio?retryWrites=true&w=majority` | From MongoDB Atlas |
| `JWT_SECRET` | A random 32+ character string | e.g. `openssl rand -hex 32` |
| `JWT_EXPIRE` | `30d` | Token expiry |
| `EMAIL_USER` | `your-gmail@gmail.com` | Gmail address for sending emails |
| `EMAIL_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail **App Password** (not regular password) |
| `ADMIN_EMAIL` | `shahzaibzaman465@gmail.com` | Admin account email |
| `ADMIN_PASSWORD` | Your secure admin password | Used on first deployment to create admin |
| `FRONTEND_URL` | `https://ever-active-physiotherapy.vercel.app` | Your Vercel domain — no trailing slash |

## Optional Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | AI chat enhancement (falls back gracefully if not set) |

---

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Create a new App Password (select "Mail" + "Other")
4. Copy the 16-character code (spaces included) as `EMAIL_PASSWORD`

---

## MongoDB Atlas Network Access

In MongoDB Atlas → Network Access:
- Add IP: `0.0.0.0/0` (Allow access from anywhere)
- This is required because Vercel serverless functions use dynamic IPs

---

## After Setting Variables

Redeploy the project from Vercel dashboard (Deployments → Redeploy) or push a new commit.

Verify deployment at: https://ever-active-physiotherapy.vercel.app/api/health
