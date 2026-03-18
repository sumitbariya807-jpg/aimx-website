# Dashboard QR Ticket Fix

**Status:** Plan approved. Implementing...

**Plan:**
1. [ ] Add qrUrl state to ParticipantDashboard
2. [ ] Add useEffect: if approved → generateQR(participantId)
3. [ ] Add conditional QR render + download
4. [ ] Test login → dashboard QR appears post-approval

**After:** `cd Aimx-website && npm run dev` → test.
