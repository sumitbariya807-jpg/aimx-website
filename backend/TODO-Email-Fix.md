# Email Fix - Step by Step TODO

## Status: 🔄 In Progress

### 1. Local Setup ✅ Ready
```
cd Aimx-website/backend
npm install  # nodemailer, qrcode already installed
```

### 2. SMTP Config (.env.example exists)
```
cp .env.example .env
```
**Edit .env:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=infoaimx2026@gmail.com
SMTP_PASS=your_app_password_here
MAIL_FROM=AIMX Events <infoaimx2026@gmail.com>
ADMIN_EMAIL=infoaimx2026@gmail.com
JWT_SECRET=aimx-jwt-secret-2026
MONGO_URI=your_mongo_uri
```

**Gmail App Password:**
1. Google Account → Security → 2-Step Verification → App passwords
2. Generate for "Mail" → Copy 16-char password to SMTP_PASS

### 3. Test Local [ ]
```
npm run dev
```
- Frontend: http://localhost:5173 → Register participant
- Backend console: Look for `✅ SMTP configured` or `SMTP not configured`
- Inbox: Check spam for registration email + admin CC

### 4. Code Changes ✅ COMPLETE
- ✅ Added welcome email to organizers.js  
- ✅ **QR in ALL registration emails** (pending + approve) + Gmail headers + fallback

### 5. Production Render [ ]
**Dashboard → Environment:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=infoaimx2026@gmail.com
SMTP_PASS=app_password
MAIL_FROM=AIMX Events <infoaimx2026@gmail.com>
ADMIN_EMAIL=infoaimx2026@gmail.com
```

### 6. Verify [ ]
- Register on production → emails sent
- Check Render logs for `✅ Registration email sent`

