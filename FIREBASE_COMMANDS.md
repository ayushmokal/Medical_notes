# 🔧 Firebase Commands Reference

## Issue: `firebase` command not found

**Reason**: Firebase CLI is not in your system PATH.

**Solution**: Use `npx firebase-tools` instead of `firebase`

---

## Common Commands

### Deploy Firestore Rules
```bash
npx firebase-tools deploy --only firestore:rules
```

### Deploy Firestore Indexes
```bash
npx firebase-tools deploy --only firestore:indexes
```

### Deploy Everything (Rules + Indexes)
```bash
npx firebase-tools deploy --only firestore
```

### List Firebase Projects
```bash
npx firebase-tools projects:list
```

### Check Current Project
```bash
npx firebase-tools use
```

### View Firestore Indexes Status
```bash
npx firebase-tools firestore:indexes
```

---

## What We Just Fixed

### 1. ✅ Deployed Firestore Security Rules
- Allows authenticated users to read/write notes and patients
- Located in: `firestore.rules`

### 2. ✅ Created Composite Index
- Collection: `notes`
- Fields: `patientId` (ascending), `createdAt` (descending)
- Located in: `firestore.indexes.json`
- **Status**: Building (may take 1-5 minutes)

### 3. ✅ Deployed Index Configuration
- Index is now building in Firebase
- Check status: https://console.firebase.google.com/project/medical-notes-system/firestore/indexes

---

## Testing Now

### Wait for Index to Build
The index is building in the background. This usually takes **1-5 minutes**.

**To check status:**
1. Go to: https://console.firebase.google.com/project/medical-notes-system/firestore/indexes
2. Look for the index with:
   - Collection: `notes`
   - Fields: `patientId`, `createdAt`
3. Status should show: **Building...** → **Enabled**

### Once Index is Ready:
1. **Refresh your browser** (Cmd+R / Ctrl+R)
2. Open **Browser Console** (F12)
3. Click on patient "Ayush Mokal"
4. Click "Start New Session"
5. Draw some notes
6. Click "Extract Medical Data (Gemini AI)"
7. Click "Save Note"
8. **Look at console logs** - should see:
   ```
   ✅ Note added successfully with ID: [id]
   🔄 Refreshing notes after session end
   ✅ Found 1 notes for patient
   ```
9. **The session should now appear in "Previous Sessions"!**

---

## If Still Not Working

### Check Console for Specific Errors:

#### Error: "The query requires an index"
- Index is still building
- Wait 1-5 more minutes
- Refresh and try again

#### Error: "Missing or insufficient permissions"
- Rules issue
- Run: `npx firebase-tools deploy --only firestore:rules`

#### Error: Network/connection issues
- Check internet connection
- Verify Firebase project status

---

## Helpful Aliases (Optional)

Add to your `~/.zshrc` to use `firebase` command:

```bash
echo 'alias firebase="npx firebase-tools"' >> ~/.zshrc
source ~/.zshrc
```

Now you can use:
```bash
firebase deploy --only firestore:rules
```

Instead of:
```bash
npx firebase-tools deploy --only firestore:rules
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy rules | `npx firebase-tools deploy --only firestore:rules` |
| Deploy indexes | `npx firebase-tools deploy --only firestore:indexes` |
| Deploy both | `npx firebase-tools deploy --only firestore` |
| List projects | `npx firebase-tools projects:list` |
| Check current project | `npx firebase-tools use` |
| View index status | `npx firebase-tools firestore:indexes` |

---

## Current Status

✅ **Firestore Rules**: Deployed  
✅ **Composite Index**: Created and deploying  
⏳ **Index Build Time**: 1-5 minutes (in progress)  
🔄 **Next Step**: Wait for index, then test again  

---

**Project**: medical-notes-system  
**Date**: October 13, 2025  
**Status**: Index building, should be ready shortly
