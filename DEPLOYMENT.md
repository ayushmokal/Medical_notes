# Deployment Guide

This guide covers deploying the Medical Notes System to Firebase Hosting.

## Prerequisites

- Completed Firebase setup (see SETUP.md)
- Firebase CLI installed
- Application tested locally

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with your Google account.

## Step 3: Initialize Firebase in Your Project

```bash
firebase init
```

When prompted:

1. **Which Firebase features?** 
   - Select: `Hosting`, `Firestore`, `Storage` (use spacebar to select, enter to continue)

2. **Use an existing project or create a new one?**
   - Select: "Use an existing project"
   - Choose your "medical-notes-system" project

3. **Firestore Rules**
   - Use default or specify: `firestore.rules`
   - Don't overwrite if file exists

4. **Storage Rules**
   - Use default or specify: `storage.rules`
   - Don't overwrite if file exists

5. **Hosting Setup**
   - Public directory: `dist` (not 'public'!)
   - Configure as single-page app: `Yes`
   - Set up automatic builds with GitHub: `No` (or Yes if you want)
   - Don't overwrite index.html: `No`

## Step 4: Build Your Application

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Step 5: Deploy Firestore & Storage Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Step 6: Deploy Hosting

```bash
firebase deploy --only hosting
```

## Step 7: Access Your Deployed App

After deployment, Firebase will provide a URL like:
```
https://medical-notes-system.web.app
```

## Updating the Deployed App

When you make changes:

```bash
# 1. Build
npm run build

# 2. Deploy
firebase deploy
```

## Environment Variables for Production

If using environment variables:

1. Update `src/config/firebase.config.js` with production credentials
2. Or use Vite environment variables:

Create `.env.production`:
```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
# ... etc
```

Update `src/config/firebase.js` to use env variables:
```javascript
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## Custom Domain (Optional)

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Add DNS records as instructed
5. Wait for SSL certificate provisioning (can take 24-48 hours)

## Deployment Checklist

Before deploying to production:

- [ ] Update Firebase security rules (firestore.rules, storage.rules)
- [ ] Set Firestore to production mode
- [ ] Enable Firebase billing (Blaze plan recommended for production)
- [ ] Test all features locally
- [ ] Update CORS settings if needed
- [ ] Set up Firebase Authentication email templates
- [ ] Configure password requirements
- [ ] Set up error logging/monitoring
- [ ] Review Firebase usage limits
- [ ] Backup your database
- [ ] Test on multiple devices/browsers

## Monitoring Your App

### Firebase Console

Monitor usage:
1. **Authentication**: Track user signups and logins
2. **Firestore**: Monitor reads/writes
3. **Storage**: Track file uploads and storage usage
4. **Hosting**: View hosting traffic

### Set Up Alerts

In Firebase Console > Project Settings > Integrations:
- Set up budget alerts
- Configure usage alerts

## Rollback Previous Deployment

If something goes wrong:

```bash
firebase hosting:rollback
```

## Multi-Environment Deployment

For staging and production:

### Create Firebase Projects
- medical-notes-staging
- medical-notes-production

### Use Aliases
```bash
firebase use --add
# Select staging project, alias: staging
# Select production project, alias: production
```

### Deploy to Specific Environment
```bash
# Deploy to staging
firebase use staging
npm run build
firebase deploy

# Deploy to production
firebase use production
npm run build
firebase deploy
```

## Continuous Deployment (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
```

Add token to GitHub Secrets as `FIREBASE_TOKEN`.

## Troubleshooting

### Build Fails
- Check Node.js version (use v16+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript/linting errors

### Deployment Fails
- Verify Firebase CLI is up to date: `npm install -g firebase-tools@latest`
- Check Firebase project permissions
- Verify billing is enabled

### 404 Errors After Deployment
- Ensure `firebase.json` has proper rewrites for SPA
- Check that `dist` folder exists before deploying

### CORS Errors
- Configure Firebase Storage CORS (create cors.json and apply)

## Performance Optimization

### Before Production
1. Enable code splitting
2. Optimize images
3. Use lazy loading for routes
4. Minify and compress assets
5. Enable Firebase Performance Monitoring

### Firebase.json Configuration

Example `firebase.json`:
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
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Security Considerations for Production

1. **Review Security Rules**: Ensure firestore.rules and storage.rules are production-ready
2. **Enable App Check**: Protect backend resources from abuse
3. **Rate Limiting**: Implement rate limiting for sensitive operations
4. **HTTPS Only**: Firebase Hosting uses HTTPS by default
5. **Audit Logs**: Enable Cloud Audit Logs
6. **Regular Updates**: Keep dependencies updated
7. **HIPAA Compliance**: Ensure compliance if handling real medical data

## Cost Estimation

### Firebase Spark (Free) Plan Limits:
- Firestore: 50K reads/day, 20K writes/day
- Storage: 5GB total, 1GB/day downloads
- Hosting: 10GB/month bandwidth

### Firebase Blaze (Pay-as-you-go):
- Suitable for production
- Free tier included, pay only for what you use

Estimate costs at: https://firebase.google.com/pricing

## Support

For deployment issues:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Status: https://status.firebase.google.com/
- Stack Overflow: Tag your questions with `firebase`
