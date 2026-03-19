# Vercel ENV Update: VITE_API_URL → https://aimx-website.onrender.com/api

**Goal:** Update Vercel production environment variable for the Aimx-website project.

**Steps:**
1. [x] cd Aimx-website && vercel env ls production (check current envs)
2. [ ] cd Aimx-website && vercel env add VITE_API_URL production (add/update env var - value: https://aimx-website.onrender.com/api)
3. [ ] cd Aimx-website && vercel --prod (redeploy)
4. [x] Refactor src/api.js to use import.meta.env.VITE_API_URL with fallback
5. [x] Update .env.example with VITE_API_URL
6. [x] git add/commit/push changes (completed)
7. [ ] Verify deployment and API calls use new URL

**Notes:**
- Current code in src/api.js hardcodes \"https://aimx-website-1.onrender.com/api\" (note: -1 subdomain).
- VITE_API_URL will be available client-side after Vite build.
- Progress tracked here.
