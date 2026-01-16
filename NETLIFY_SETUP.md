# Netlify Deployment Setup Guide

## ✅ Configuration Complete

I've created `netlify.toml` with the correct settings for your portfolio.

## 🚀 Next Steps to Deploy on Netlify

### Option 1: Connect via GitHub (Recommended)

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com
   - Sign in with your GitHub account

2. **Add New Site:**
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your repositories

3. **Select Repository:**
   - Choose: `Yacinewhatchandcode/Yace19ai.com`
   - Netlify will auto-detect the `netlify.toml` configuration

4. **Configure Build Settings (Auto-detected):**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Manual Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 3: Drag & Drop Deploy

1. Build your site: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder to the deploy area

## 🔧 Configure Custom Domain (yace19ai.com)

1. **In Netlify Dashboard:**
   - Go to your site → "Domain settings"
   - Click "Add custom domain"
   - Enter: `yace19ai.com`

2. **Update DNS Records:**
   Netlify will provide you with DNS records. Update your domain registrar:

   **Option A: CNAME (Recommended)**
   ```
   Type: CNAME
   Name: @ (or yace19ai.com)
   Value: [your-site-name].netlify.app
   ```

   **Option B: A Records**
   ```
   75.2.60.5
   99.83.190.102
   ```

3. **Enable HTTPS:**
   - Netlify automatically provisions SSL certificates
   - Go to "Domain settings" → "HTTPS"
   - Click "Verify DNS configuration"
   - Wait 5-15 minutes for SSL to activate

## 📋 Current Configuration

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

This configuration:
- ✅ Builds your Vite React app
- ✅ Publishes from `dist` folder
- ✅ Handles SPA routing (all routes → index.html)
- ✅ Uses Node 20 for builds

## 🔍 Verify Deployment

After deployment:
1. Visit your Netlify URL: `https://[your-site].netlify.app`
2. Check custom domain: `https://yace19ai.com`
3. Verify HTTPS is active (green padlock)

## 🐛 Troubleshooting

**If site shows 404:**
- Check build logs in Netlify dashboard
- Verify `dist` folder contains `index.html`
- Ensure `netlify.toml` is in repository root

**If custom domain doesn't work:**
- Verify DNS records are correct
- Wait 24-48 hours for DNS propagation
- Check Netlify domain settings for errors

**If build fails:**
- Check Node version (should be 20)
- Verify all dependencies are in `package.json`
- Review build logs in Netlify dashboard

## 📊 Build Status

You can monitor deployments at:
- Netlify Dashboard → Your Site → Deploys
- GitHub Actions (if connected)

## 🎯 Quick Deploy Command

Once connected, every push to `main` branch will auto-deploy!
