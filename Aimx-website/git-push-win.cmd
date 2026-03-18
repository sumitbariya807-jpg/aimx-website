@echo off
cd /d Aimx-website
git add .
git commit -m "Full Aimx-website project for live Vercel deploy"
git push origin main
echo.
echo Repo updated: https://github.com/sumitbariya807-jpg/aimx-website
echo Run: vercel --prod for new live URL.
pause

