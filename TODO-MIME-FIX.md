# Fix Vercel MIME Type Error (JS as text/html)

**Goal:** Prevent rewrite of static assets to index.html.

**Steps:**
1. Create TODO
2. [x] Update vercel.json rewrites (exclude assets/files)
3. [x] Remove hardcoded VITE_API_URL from vite.config.js
4. [x] git add/commit/push
5. [x] vercel --prod redeploy
6. Verify browser console no MIME errors, assets load

**Why error:** `/(.*)` rewrites /assets/*.js → index.html (text/html MIME).

**New rewrites:** Exclude /assets|.*\..* , API calls direct to Render (no proxy needed, fetch in code).

Progress: Starting...
