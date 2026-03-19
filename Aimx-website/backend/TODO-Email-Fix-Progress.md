# Email Fix Progress Tracker

**Status:** 🔧 Diagnosing - Connection Timeout Issue

## Completed:
- [x] Analyzed code (emailService.js perfect)
- [x] Render env vars set (confirmed)
- [x] Redeployed ✓
- [x] Health check: Server running on port 10000

## Issue Identified: SMTP Connection Timeout
**Render Logs:** `Registration email error: Connection timeout`  
**Cause:** Gmail SMTP blocking Render IP (common free-tier issue: slow cold starts + strict Gmail policies)

## Solutions (Quickest First):

### 1. **Fix Gmail SMTP (Recommended)**
```
Environment → Update SMTP vars:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465    # Change to SSL (was 587 TLS)
SMTP_SECURE=true # Add this
```
**OR** Test different port:
```
SMTP_PORT=465
```
Manual redeploy → test.

### 2. **Switch to Resend (Free 100/day, Render-friendly)**
1. Sign up: https://resend.com → Free API key
2. Render Env:
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend  # literal "resend"
SMTP_PASS=your_api_key
MAIL_FROM=noreply@aimx2026.com  # Verified domain
ADMIN_EMAIL=infoaimx2026@gmail.com
```
3. Verify domain @resend.com dashboard.

### 3. **Add Email Debug Logging** (Immediate)
I'll update emailService.js to log full SMTP config/debug.

## Immediate Action:
1. Try **SMTP_PORT=465** in Render → redeploy → test registration
2. Reply with new logs OR confirm Resend preference

## Test Command:
```bash
curl https://aimx-website.onrender.com/
```

**Expected Success Logs:**
```
✅ Transporter created (host: smtp.gmail.com)
✅ Registration email sent...
```


