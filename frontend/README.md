# EverActive Physiotherapy — Frontend

React + Vite frontend for the EverActive Physiotherapy clinic platform.

## Local development

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to your backend API (default: `http://localhost:5003/api`).

## Vercel deployment (frontend)

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), import the repo.
3. Use these settings:
   - **Root Directory:** leave empty (repo root) — `vercel.json` at the root handles the build.
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` = your deployed backend URL, e.g. `https://your-api.onrender.com/api`
5. Deploy.

## Backend deployment (separate)

The API in `/backend` must be deployed separately (Render, Railway, etc.):

- Set `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel URL), email vars, and optional `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Add your Vercel URL to backend CORS via `FRONTEND_URL`.
- Point frontend `VITE_API_URL` at the live backend.

## Build check

```bash
cd frontend && npm run build
```
