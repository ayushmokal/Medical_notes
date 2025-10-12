# Quick Reference Guide

Fast reference for common tasks and commands.

## 🚀 Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/config/firebase.config.js` | **UPDATE THIS with your Firebase credentials** |
| `src/components/NoteSession.jsx` | Canvas and note-taking logic |
| `src/services/ocrService.js` | OCR and medical data extraction |
| `firestore.rules` | Database security rules |
| `storage.rules` | Storage security rules |

## 🔥 Firebase Console URLs

```
Main Console: https://console.firebase.google.com/
Authentication: /project/YOUR_PROJECT/authentication/users
Firestore: /project/YOUR_PROJECT/firestore
Storage: /project/YOUR_PROJECT/storage
Hosting: /project/YOUR_PROJECT/hosting
```

## 🐛 Common Issues & Solutions

### Issue: Firebase not initialized
```javascript
// Solution: Update src/config/firebase.config.js with your credentials
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  // ... rest of config
};
```

### Issue: Can't read/write to Firestore
```bash
# Solution: Update Firestore rules to test mode (temporary)
# Go to: Firebase Console > Firestore > Rules
# Set expiration date to future
```

### Issue: OCR not working
```javascript
// Make sure you're drawing on canvas first
// Wait 10-30 seconds for processing
// Check browser console for errors
```

### Issue: Canvas not showing
```bash
# Solution: Check browser console
# Make sure tldraw CSS is imported
# Try clearing cache and hard refresh (Cmd+Shift+R)
```

### Issue: Build fails
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Code Snippets

### Add a New Patient (API)
```javascript
import { patientService } from './services/patientService';

const patientData = {
  fullName: "John Doe",
  gender: "Male",
  dateOfBirth: "1990-01-01",
  phoneNumber: "+1234567890",
  email: "john@example.com",
  address: "123 Main St",
  emergencyContact: "Jane: +1234567890",
  insuranceInfo: "Provider: Policy#",
  medicalHistory: "Medical history here"
};

const result = await patientService.addPatient(doctorId, patientData);
```

### Get All Patients
```javascript
const result = await patientService.getPatientsByDoctor(doctorId);
if (result.success) {
  console.log(result.patients);
}
```

### Save a Note
```javascript
import { notesService } from './services/notesService';

const noteData = {
  rawText: "Extracted text...",
  extractedData: { vitals: {}, symptoms: [] },
  sessionDate: new Date().toISOString()
};

const result = await notesService.addNote(patientId, doctorId, noteData);
```

### Extract Text with OCR
```javascript
import { ocrService } from './services/ocrService';

// From canvas snapshot
const result = await ocrService.extractText(imageData);
if (result.success) {
  const medicalData = ocrService.extractMedicalData(result.text);
  console.log(medicalData);
}
```

## 🎨 Styling Variables

```css
/* src/styles/index.css */
:root {
  --primary-color: #2563eb;        /* Main brand color */
  --primary-hover: #1d4ed8;        /* Hover state */
  --secondary-color: #64748b;      /* Secondary actions */
  --success-color: #10b981;        /* Success messages */
  --danger-color: #ef4444;         /* Errors/delete */
  --warning-color: #f59e0b;        /* Warnings */
  --text-primary: #1e293b;         /* Main text */
  --text-secondary: #64748b;       /* Secondary text */
  --border-color: #e2e8f0;         /* Borders */
  --bg-light: #f8fafc;             /* Light backgrounds */
}
```

## 🔐 Security Rules Quick Reference

### Test Mode (Development Only)
```javascript
// Firestore - Allow all authenticated users (DEV ONLY)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Production Mode
```javascript
// Firestore - Doctor can only access their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if request.auth != null && 
                            resource.data.doctorId == request.auth.uid;
    }
  }
}
```

## 📊 Firebase Quota Limits

### Spark Plan (Free)
```
Firestore:
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
  - 1 GB storage

Storage:
  - 5 GB storage
  - 1 GB/day downloads

Authentication:
  - Unlimited users
```

### Blaze Plan (Pay-as-you-go)
```
Free tier included, then pay per use:
  - $0.06 per 100K reads
  - $0.18 per 100K writes
  - $0.02 per 100K deletes
  - $0.18 per GB storage/month
```

## 🧪 Test Data

### Sample Patient
```javascript
{
  fullName: "Jane Smith",
  gender: "Female",
  dateOfBirth: "1985-05-15",
  phoneNumber: "+1 (555) 234-5678",
  email: "jane.smith@email.com",
  address: "456 Oak Ave, Springfield, IL 62701",
  emergencyContact: "John Smith (Husband): +1 (555) 234-5679",
  insuranceInfo: "Blue Cross Blue Shield: Policy #BC123456",
  medicalHistory: "Allergies: Penicillin. Previous: Appendectomy (2010). Current meds: None."
}
```

### Sample Note for OCR
```
Patient: Jane Smith
Date: October 12, 2025

Chief Complaint: Annual checkup

Vitals:
BP: 118/76
HR: 68
Temp: 98.2
Weight: 145 lbs

Symptoms: None, routine checkup

Assessment: Patient appears healthy, all vitals normal

Plan: Continue routine checkups, no medications needed
```

## 🔍 Debugging Tips

### Enable Verbose Logging
```javascript
// In src/config/firebase.js, add:
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Persistence error:', err);
  });
```

### Check Firebase Connection
```javascript
// Test Firestore connection
import { collection, addDoc } from 'firebase/firestore';

const testConnection = async () => {
  try {
    await addDoc(collection(db, 'test'), { test: true });
    console.log('✅ Firebase connected');
  } catch (error) {
    console.error('❌ Firebase error:', error);
  }
};
```

### Monitor Performance
```javascript
// In browser console
performance.getEntriesByType('navigation')[0].loadEventEnd
// Should be < 3000ms for good performance
```

## 📱 Device Testing Sizes

```
Desktop:    1920x1080
Laptop:     1366x768
Tablet:     768x1024
Mobile:     375x667
Large Phone: 414x896
```

## 🎯 Canvas Dimensions

```javascript
// A4 size (standard paper)
const canvasSize = {
  width: '210mm',   // 793.7px at 96dpi
  height: '297mm',  // 1122.5px at 96dpi
};

// For US Letter size
const letterSize = {
  width: '8.5in',   // 816px at 96dpi
  height: '11in',   // 1056px at 96dpi
};
```

## 🛠 VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier
- Firebase
- Auto Rename Tag
- Path Intellisense

## ⌨️ Keyboard Shortcuts

```
Development Server:
  Ctrl+C              Stop server
  
tldraw Canvas:
  V                   Select tool
  D                   Draw tool
  E                   Eraser
  T                   Text
  Cmd/Ctrl+Z         Undo
  Cmd/Ctrl+Shift+Z   Redo
  Cmd/Ctrl++         Zoom in
  Cmd/Ctrl+-         Zoom out
```

## 📚 Learning Resources

### React
- https://react.dev/learn
- https://react.dev/reference/react

### Firebase
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/firestore
- https://firebase.google.com/docs/storage

### tldraw
- https://tldraw.dev
- https://github.com/tldraw/tldraw

### Tesseract.js
- https://tesseract.projectnaptha.com/
- https://github.com/naptha/tesseract.js

## 💡 Pro Tips

1. **Always test in incognito mode** to simulate fresh user
2. **Keep Firebase Console open** while developing
3. **Use React DevTools** for debugging components
4. **Monitor Firestore usage** to avoid quota issues
5. **Clear browser cache** if seeing old code
6. **Use meaningful commit messages** for version control
7. **Backup Firestore data** before major changes
8. **Test on real devices** not just browser resize

## 🔗 Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Status](https://status.firebase.google.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [tldraw Docs](https://tldraw.dev/)

---

**Keep this file handy for quick reference!**
