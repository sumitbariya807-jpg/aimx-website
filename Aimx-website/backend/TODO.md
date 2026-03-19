# Backend Route Fix Plan - Render /healthz 404

## Steps:
- [ ] 1. Edit Aimx-website/backend/routes/participants.js - prefix all paths with /participants/
- [ ] 2. Edit Aimx-website/backend/routes/organizers.js - prefix all paths with /organizers/ 
- [ ] 3. git add . && git commit && git push
- [ ] 4. Test Render /healthz → 200 OK
- [ ] 5. Update frontend api.js if endpoint paths changed
- [ ] 6. Test API endpoints on Render
