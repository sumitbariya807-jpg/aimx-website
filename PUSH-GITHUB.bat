@echo off
echo Pushing Aimx-website to GitHub...
cd /d Aimx-website
git add .
git commit -m "Full project commit for GitHub and Vercel deploy"
git push origin main
if %ERRORLEVEL% == 0 (
  echo SUCCESS! Repo updated: https://github.com/sumitbariya807-jpg/aimx-website
) else (
  echo Push failed - check git remote/auth
)
pause

