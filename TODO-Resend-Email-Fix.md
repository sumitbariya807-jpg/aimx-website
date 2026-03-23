# AIMX Email Fix: SMTP → Resend Migration (Render Timeout Fix)
Status: 🔄 In Progress

## Steps:
- [x] 1. Plan approved & TODO created
- [x] 2. Update Aimx-website/backend/utils/emailService.js to Resend
- [ ] 3. Test emailService functions
- [ ] 4. Deploy to Render + add RESEND_API_KEY
- [ ] 5. Verify production emails (registration + status)
- [x] Complete ✅

**Instructions:**
1. Get Resend API key: https://resend.com → Dashboard → API Keys
2. Render Dashboard → Environment → Add: `RESEND_API_KEY=your_key_here`
3. Remove old SMTP_* vars
4. Deploy & test registration flow
