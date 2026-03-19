# Fresh Vercel Deploy Steps (Run in VSCode Terminal)

1. **cd Aimx-website**
2. **git remote -v** - Check origin (if none/missing, create repo first)
3. **Create GitHub repo** if missing: github.com/new → name `aimx-website`, public, create → copy HTTPS URL (https://github.com/sumitbariya807-jpg/aimx-website.git)
4. **Add remote & push**:
   ```
   git remote add origin https://github.com/sumitbariya807-jpg/aimx-website.git
   git branch -M main
   git push -u origin main
   ```
5. **Deploy**:
   ```
   vercel --prod
   ```
   - Prompts: Yes to setup, your scope, new project, name `aimx-website`.
   - **Live URL printed** (e.g. aimx-website-xxx.vercel.app)

✅ Site live! Vercel CLI ready.

**Note**: dist/ committed for static serve. vite.config base='/aimx-website/' for subpath compat.
