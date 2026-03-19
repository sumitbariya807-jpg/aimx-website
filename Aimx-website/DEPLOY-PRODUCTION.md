# 🚀 Production Deployment Guide (Vercel + Render)

## 🎯 Fix API Connection Error

Your frontend already uses `VITE_API_URL` correctly!

## 1. Frontend (.env created ✅)
```
VITE_API_URL=https://aimx-website-1.onrender.com
```
**Vercel Dashboard:**
- Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://YOUR-RENDER-BACKEND.onrender.com`

## 2. Backend (.env created ✅) 
```
FRONTEND_URL=https://aimx-website-phi.vercel.app
```
**Render Dashboard:**
- Environment → Add: `FRONTEND_URL` = `https://YOUR-VERCEL-FRONTEND.vercel.app`

## 3. Backend CORS Update (server.js)
CORS now reads `process.env.FRONTEND_URL` instead of `*`

## 4. Deploy
```bash
cd Aimx-website
git add .
git commit -m "fix: production API env vars"
git push origin main
```
**Auto-redeploys** Vercel + Render

## 5. Test
```
# Local dev (uses /api proxy)
npm run dev

# Production - check Network tab
Open deployed Vercel URL → F12 → Network → API calls should hit Render URL
```

## ✅ Expected Result
```
Local: http://localhost:5173 → /api/participants/register (Vite proxy)
Prod: https://vercel.app → https://render.com/api/participants/register
```
**No more `ERR_CONNECTION_REFUSED`!**

