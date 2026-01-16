# Fix SSL Certificate Error for yace19ai.com

## Issue
`NET::ERR_CERT_COMMON_NAME_INVALID` - SSL certificate doesn't match the domain

## Solution Steps

### 1. Configure Custom Domain in GitHub Repository

1. Go to your repository: https://github.com/Yacinewhatchandcode/Yace19ai.com
2. Click **Settings** → **Pages** (in left sidebar)
3. Under **Custom domain**, enter: `yace19ai.com`
4. Check **Enforce HTTPS** (this will provision SSL certificate)
5. Click **Save**

### 2. Verify DNS Settings

Your DNS should point to GitHub Pages:

**A Records:**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**OR CNAME Record:**
```
yace19ai.com → Yacinewhatchandcode.github.io
```

### 3. Wait for SSL Certificate Provisioning

- GitHub automatically provisions SSL certificates for custom domains
- This can take **15 minutes to 24 hours**
- You'll see a green checkmark when SSL is active

### 4. Verify SSL Certificate

Once provisioned, visit:
- https://yace19ai.com (should work with green padlock)
- Check certificate: Click padlock → Certificate → Verify it shows `yace19ai.com`

### 5. Force HTTPS Redirect

GitHub Pages will automatically redirect HTTP to HTTPS once SSL is active.

## Current Status

✅ CNAME file is correct: `yace19ai.com`
✅ Build includes CNAME in dist folder
✅ Base path configured in vite.config.ts
⏳ Waiting for GitHub to provision SSL certificate

## Troubleshooting

If SSL doesn't activate after 24 hours:

1. **Remove and re-add custom domain:**
   - Remove domain from GitHub Pages settings
   - Wait 5 minutes
   - Re-add domain
   - Check "Enforce HTTPS"

2. **Verify DNS propagation:**
   ```bash
   dig yace19ai.com
   nslookup yace19ai.com
   ```

3. **Check GitHub Pages status:**
   - Go to Settings → Pages
   - Look for any error messages
   - Check if domain is verified

4. **Clear browser cache:**
   - The error might be cached
   - Try incognito/private mode

## Alternative: Use GitHub's Default Domain

If SSL continues to fail, you can temporarily use:
- `https://yacinewhatchandcode.github.io/Yace19ai.com/`

But custom domain is preferred for branding.
