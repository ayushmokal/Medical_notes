# Firebase CLI Setup Guide

## 🚀 Automated Firebase Setup Using CLI

Instead of manually clicking through the Firebase Console, you can use the Firebase CLI to set up everything via terminal commands!

## 📋 Prerequisites

✅ Node.js and npm installed (currently installing...)

## Step 1: Install Firebase CLI

Once Node.js installation completes, run:

```bash
npm install -g firebase-tools
```

This installs the Firebase command-line tools globally.

## Step 2: Login to Firebase

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Request permissions for Firebase CLI
4. Return to terminal when done

## Step 3: Create Firebase Project (CLI Method)

```bash
# Create a new project
firebase projects:create medical-notes-system

# Set it as default for this directory
firebase use medical-notes-system
```

## Step 4: Initialize Firebase Services

Run this in your project directory:

```bash
cd /Users/ayushmokal/Documents/Medical_notes
firebase init
```

When prompted, select:
- **Firestore**: Rules and indexes
- **Storage**: Security rules  
- **Hosting**: (optional, for deployment later)

Configuration:
- Firestore rules file: `firestore.rules` (already created!)
- Firestore indexes file: `firestore.indexes.json` (already created!)
- Storage rules file: `storage.rules` (already created!)
- Public directory: `dist`
- Single-page app: `Yes`

## Step 5: Enable Services (Web Console Required)

Some services still need the web console:

### Enable Authentication
```bash
# Open your project in browser
firebase open auth
```

Then in the browser:
1. Click "Get Started"
2. Enable "Email/Password"
3. Click "Save"

### Create Firestore Database
```bash
# Open Firestore
firebase open firestore
```

Then in the browser:
1. Click "Create Database"
2. Select "Start in test mode" (for development)
3. Choose your location
4. Click "Enable"

### Enable Storage
```bash
# Open Storage
firebase open storage
```

Then in the browser:
1. Click "Get Started"
2. Use default rules
3. Choose same location as Firestore
4. Click "Done"

## Step 6: Get Firebase Configuration

```bash
# This command shows your Firebase config
firebase apps:sdkconfig web
```

Copy the output and update `src/config/firebase.config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "medical-notes-system.firebaseapp.com",
  projectId: "medical-notes-system",
  storageBucket: "medical-notes-system.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 7: Deploy Security Rules

Deploy your Firestore and Storage security rules:

```bash
# Deploy all rules
firebase deploy --only firestore:rules,storage:rules
```

## 🎯 Complete Automated Setup Script

Here's a script that does everything (run after Node.js installation):

```bash
#!/bin/bash

echo "🔥 Firebase CLI Setup for Medical Notes System"
echo "=============================================="

# 1. Install Firebase CLI
echo "📦 Installing Firebase CLI..."
npm install -g firebase-tools

# 2. Login to Firebase
echo "🔐 Logging in to Firebase..."
firebase login

# 3. Create project (or use existing)
echo "🏗️  Creating Firebase project..."
firebase projects:create medical-notes-system --display-name "Medical Notes System"

# 4. Use the project
firebase use medical-notes-system

# 5. Initialize Firebase (interactive)
echo "⚙️  Initializing Firebase services..."
firebase init firestore storage

# 6. Get configuration
echo "📋 Getting Firebase configuration..."
firebase apps:sdkconfig web

echo ""
echo "✅ CLI setup complete!"
echo ""
echo "🌐 Next steps (require web browser):"
echo "1. Enable Authentication: firebase open auth"
echo "2. Create Firestore Database: firebase open firestore"
echo "3. Enable Storage: firebase open storage"
echo "4. Copy the config above to src/config/firebase.config.js"
echo ""
echo "Then run: npm install && npm run dev"
```

## 📝 Alternative: Quick Manual Setup

If CLI is too complex, here's the fastest manual way:

### 1. Create Project
https://console.firebase.google.com/

Click "Add project" → Name it "medical-notes-system"

### 2. Enable Services (One-Click URLs)

After creating project, visit these URLs (replace YOUR_PROJECT_ID):

```
Authentication:
https://console.firebase.google.com/project/medical-notes-system/authentication

Firestore:
https://console.firebase.google.com/project/medical-notes-system/firestore

Storage:
https://console.firebase.google.com/project/medical-notes-system/storage

Get Config:
https://console.firebase.google.com/project/medical-notes-system/settings/general
```

### 3. Copy Configuration

Scroll to "Your apps" → Click web icon → Copy config

## 🔄 Firebase CLI Commands Reference

### Project Management
```bash
firebase login                    # Login to Firebase
firebase logout                   # Logout
firebase projects:list            # List all projects
firebase use <project-id>         # Switch projects
firebase open                     # Open console
```

### Deployment
```bash
firebase deploy                   # Deploy everything
firebase deploy --only hosting    # Deploy app
firebase deploy --only firestore  # Deploy Firestore rules
firebase deploy --only storage    # Deploy Storage rules
```

### Development
```bash
firebase serve                    # Local hosting server
firebase emulators:start          # Start local emulators
```

### Information
```bash
firebase apps:list                # List apps
firebase apps:sdkconfig web       # Get web config
firebase projects:list            # List projects
```

## 🎯 Recommended Workflow

### Option A: Mostly CLI (Recommended)
```bash
# Terminal
npm install -g firebase-tools
firebase login
firebase projects:create medical-notes-system
firebase use medical-notes-system
firebase init firestore storage

# Browser (one time only)
firebase open auth      # Enable Email/Password
firebase open firestore # Create database
firebase open storage   # Enable storage

# Terminal
firebase apps:sdkconfig web  # Get config
# Copy to firebase.config.js

# Done!
firebase deploy --only firestore:rules,storage:rules
```

### Option B: Pure Web Console (Easiest)
```bash
# Just open browser:
1. Go to https://console.firebase.google.com/
2. Create project
3. Enable Auth, Firestore, Storage (click-click-click)
4. Copy config
5. Done!
```

## 💡 Pro Tips

1. **Use Firebase CLI for deployment**
   - Easier to update rules
   - Version control friendly
   - Faster than web console

2. **Use Web Console for initial setup**
   - Visual interface
   - Easier to understand
   - Better for first time

3. **Best of both worlds**
   - Create project in web console
   - Use CLI for deployment
   - Use web console to monitor

## 🚨 Common Issues

### "Command not found: firebase"
```bash
# Solution: Install Firebase CLI
npm install -g firebase-tools

# If still not found, add to PATH:
export PATH="$PATH:$(npm get prefix)/bin"
```

### "Not logged in"
```bash
firebase login --reauth
```

### "Permission denied"
```bash
# Install globally with correct permissions
sudo npm install -g firebase-tools
```

## ✅ What's Next After Setup?

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Test the application

4. Deploy when ready:
   ```bash
   npm run build
   firebase deploy
   ```

## 📊 Setup Comparison

| Method | Time | Difficulty | Recommended For |
|--------|------|-----------|----------------|
| **Web Console** | 10 min | Easy | First time users |
| **Firebase CLI** | 5 min | Medium | Developers |
| **Automated Script** | 3 min | Easy | Power users |

## 🎓 Learning Resources

- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Current Status**: Waiting for Node.js installation to complete...

**Next**: Once Node.js is installed, choose your setup method above!
