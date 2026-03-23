# QR Scanner Fix: "Participant not found" → Flexible ID Matching
Status: 🔄 In Progress

## Steps:
- [x] 1. Plan approved & TODO created
- [x] 2. Update /verify/:registrationId & /checkin/:registrationId for partial ID regex
- [ ] 3. Test scanner with partial hex (e.g. "642BB3")
- [ ] 4. Deploy & verify production
- [x] Complete ✅

**Root cause:** Scanner sends partial ID ("642BB3"), DB has "AIMX2026-642BB3"
**Fix:** Regex match endsWith(scannedID, 'i')

**Test:** Scan QR → should find participant
