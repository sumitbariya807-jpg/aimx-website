# Backend Route Fix Plan - Render /healthz 404 (Updated)

## Steps:
- [x] 1. Edit Aimx-website/backend/routes/participants.js - prefix all paths with /participants/
- [x] 2. Edit Aimx-website/backend/routes/organizers.js - prefix all paths with /organizers/ 
- [x] 3. git add . && git commit && git push (c2cb470)
- [ ] 4. Copy fixes to root backend/ dir (Render likely uses root/backend/server.js missing /healthz)
- [ ] 5. Test Render /healthz → 200 OK
- [ ] 6. Update frontend api.js endpoints (/api/participants → /api/participants/participants)

