# Root Backend Render Deploy Fix

**Issue:** root/backend/server.js mounts both routes at '/api' → collision, /api/participants/register 404.

**Fix:**
- [ ] Edit server.js: app.use('/api/participants', participants); app.use('/api/organizers', organizers);
- [ ] cd backend; git add . ; git commit -m "fix: route mounts for Render"; git push
- [ ] Test /api/participants/register

**Note:** Aimx-website/backend correct, but Render uses root/backend.

