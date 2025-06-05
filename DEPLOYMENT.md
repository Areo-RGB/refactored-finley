# 🚀 Deployment Guide - Finley PWA

This guide covers deploying the refactored Finley PWA to various platforms.

## 📋 Prerequisites

- Node.js 16+ installed
- Git repository access
- Build command: `npm run build`
- Output directory: `dist/`

## 🌐 Platform Deployment

### **Vercel (Recommended)**

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import `Areo-RGB/refactored-finley`

2. **Configuration:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables:**
   ```
   NODE_VERSION=18
   ```

4. **Deploy:**
   - Click "Deploy"
   - Your app will be available at `https://refactored-finley.vercel.app`

### **Netlify**

1. **Connect Repository:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select `refactored-finley`

2. **Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Deploy:**
   - Click "Deploy site"
   - Configure custom domain if needed

### **GitHub Pages**

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"

2. **Create Workflow:**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/deploy-pages@v1
           with:
             artifact_name: github-pages
             path: dist
   ```

### **Firebase Hosting**

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize:**
   ```bash
   firebase init hosting
   ```

3. **Configure `firebase.json`:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## ⚙️ Build Configuration

### **Environment Variables**

Create `.env` file for local development:
```env
VITE_APP_TITLE=Finley PWA
VITE_API_URL=https://your-api-url.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

### **Production Optimizations**

The build is already optimized with:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ SCSS compilation
- ✅ ES6 module bundling
- ✅ PWA service worker
- ✅ Responsive images

## 🔧 Custom Domain Setup

### **Vercel Custom Domain**
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

### **Netlify Custom Domain**
1. Go to Site Settings → Domain management
2. Add custom domain
3. Update DNS records

## 📱 PWA Deployment Checklist

- ✅ `manifest.json` configured
- ✅ Service worker registered
- ✅ Icons in multiple sizes
- ✅ HTTPS enabled (automatic on most platforms)
- ✅ Responsive design tested
- ✅ Offline functionality working

## 🧪 Testing Deployment

After deployment, test:

1. **Functionality:**
   - All pages load correctly
   - Video playback works
   - Timer functionality
   - Theme switching

2. **PWA Features:**
   - Install prompt appears
   - Offline functionality
   - Service worker caching

3. **Performance:**
   - Fast loading times
   - Smooth animations
   - Mobile responsiveness

## 🚨 Troubleshooting

### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **SCSS Issues**
- Ensure all SCSS imports are correct
- Check for missing variables or mixins

### **PWA Issues**
- Verify service worker registration
- Check manifest.json validity
- Ensure HTTPS is enabled

## 📊 Performance Monitoring

Consider adding:
- Google Analytics
- Web Vitals monitoring
- Error tracking (Sentry)
- Performance monitoring

## 🔄 Continuous Deployment

Most platforms support automatic deployment:
- **Vercel**: Auto-deploys on push to main
- **Netlify**: Auto-deploys on push to main
- **GitHub Pages**: Uses GitHub Actions workflow

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Verify build logs
3. Test locally with `npm run preview`
4. Check browser console for errors

---

**The refactored Finley PWA is optimized for modern deployment platforms and should work seamlessly with minimal configuration!**
