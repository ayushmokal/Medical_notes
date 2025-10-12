# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Firebase Setup (Required)

### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Name it "medical-notes-system"
4. Enable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In left sidebar, click "Authentication"
2. Click "Get started"
3. Click "Email/Password" under Sign-in method
4. Toggle "Enable" switch
5. Click "Save"

### Create Firestore Database
1. In left sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose your location (select closest to you)
5. Click "Enable"

### Enable Storage
1. In left sidebar, click "Storage"
2. Click "Get started"
3. Click "Next" for security rules
4. Choose same location as Firestore
5. Click "Done"

### Get Your Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register app with nickname "Medical Notes Web"
6. Copy all the configuration values

### Update Configuration
Open `src/config/firebase.config.js` and replace the placeholder values:

```javascript
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
```

## Step 3: Run the Application
```bash
npm run dev
```

Your app will open at http://localhost:3000

## Step 4: First Use

1. Click "Register" on the login page
2. Enter your email and password (min 6 characters)
3. You'll be logged in automatically
4. Click "Add New Patient" to add your first patient
5. Fill in all patient details
6. Click a patient to view details
7. Click "Start New Session" to begin note-taking

## Troubleshooting

### "Firebase not initialized" error
- Double-check your firebase.config.js has the correct values
- Make sure you replaced ALL placeholder values
- Restart the dev server: Ctrl+C then `npm run dev`

### "Permission denied" errors
- Go to Firestore Database > Rules
- Make sure test mode is enabled OR add proper security rules
- For testing, you can use:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Canvas not loading
- Clear browser cache
- Try a different browser (Chrome recommended)
- Check browser console for errors (F12)

### OCR not working
- Make sure you draw on the canvas first
- Wait a few seconds for Tesseract to initialize
- Use clear, legible handwriting

## Need Help?

Check the main README.md for detailed documentation.
