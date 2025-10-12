# Testing Guide & Feature Checklist

Complete testing guide for the Medical Notes System.

## Pre-Testing Setup

- [ ] Firebase project configured
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Browser console open (F12)

## 1. Authentication Testing

### Registration
- [ ] Navigate to login page
- [ ] Click "Register" link
- [ ] Test with invalid email format → Should show error
- [ ] Test with password < 6 characters → Should show error
- [ ] Register with valid credentials → Should redirect to dashboard
- [ ] Verify user appears in Firebase Auth console

### Login
- [ ] Logout from dashboard
- [ ] Try login with wrong password → Should show error
- [ ] Try login with non-existent email → Should show error
- [ ] Login with correct credentials → Should redirect to dashboard
- [ ] Verify user email displays in header

### Session Persistence
- [ ] Refresh page while logged in → Should stay logged in
- [ ] Close and reopen browser → Should stay logged in
- [ ] Logout → Should redirect to login page

## 2. Patient Management Testing

### Add Patient
- [ ] Click "Add New Patient" button
- [ ] Try submitting empty form → Should prevent submission
- [ ] Fill in all required fields:
  - [ ] Full Name: "John Doe"
  - [ ] Gender: Select "Male"
  - [ ] Date of Birth: Select a date
  - [ ] Phone: "+1 (555) 123-4567"
  - [ ] Email: "john.doe@example.com"
  - [ ] Address: "123 Main St, City, State 12345"
  - [ ] Emergency Contact: "Jane Doe: +1 (555) 987-6543"
  - [ ] Insurance: "Blue Cross: Policy 123456"
  - [ ] Medical History: "No known allergies. Previous appendectomy."
- [ ] Click "Add Patient" → Should save and return to patient list
- [ ] Verify patient appears in Firestore console
- [ ] Patient card should display:
  - [ ] First letter avatar
  - [ ] Full name
  - [ ] Truncated patient ID
  - [ ] Gender and DOB
  - [ ] Phone number

### View Patient List
- [ ] Add 3-5 patients for testing
- [ ] All patients should display in grid layout
- [ ] Grid should be responsive (resize browser)
- [ ] Empty state message when no patients

### Patient Details
- [ ] Click on a patient card
- [ ] Should show detailed view with all patient info:
  - [ ] Full name as header
  - [ ] Patient ID (full)
  - [ ] Gender
  - [ ] Date of Birth
  - [ ] Phone Number
  - [ ] Email
  - [ ] Address
  - [ ] Emergency Contact
  - [ ] Insurance Information
  - [ ] Medical History (full text)
- [ ] "Back to Patients" button should work
- [ ] "Start New Session" button should be visible

## 3. Note Session Testing

### Starting a Session
- [ ] Select a patient
- [ ] Click "Start New Session"
- [ ] Should navigate to note session view
- [ ] Canvas should be visible (A4 size: 210mm x 297mm)
- [ ] Side panel should be visible
- [ ] Header shows patient name

### Canvas Functionality
- [ ] tldraw canvas loads without errors
- [ ] Can draw/write on canvas
- [ ] Can use different drawing tools
- [ ] Can erase content
- [ ] Can undo/redo actions
- [ ] Can zoom in/out
- [ ] Can pan around canvas

### Side Panel Features
- [ ] Patient details section shows correct info
- [ ] Medical history is readable
- [ ] All action buttons are visible:
  - [ ] "Extract Text via OCR"
  - [ ] "Cancel Note"
  - [ ] "Save Note & Extract Data"
- [ ] "Hide/Show Panel" button toggles panel

### Writing Test Notes

Write the following on canvas for OCR testing:

```
Patient Name: John Doe
Date: October 12, 2025

Vitals:
BP: 120/80
HR: 72
Temp: 98.6

Symptoms: fever, cough, fatigue

Diagnosis: Common cold

Medications: Acetaminophen 500mg, rest, fluids
```

### OCR Text Extraction
- [ ] Write test notes on canvas (see above)
- [ ] Click "Extract Text via OCR"
- [ ] Button should show "Extracting..." state
- [ ] Wait for OCR to complete (10-30 seconds)
- [ ] Extracted text should appear in textarea
- [ ] Text should be editable
- [ ] Extracted Medical Data section should show:
  - [ ] Vitals (BP, HR, Temp) if detected
  - [ ] Symptoms list if detected
  - [ ] Diagnosis list if detected
  - [ ] Medications list if detected

### Saving Notes
- [ ] Click "Save Note & Extract Data"
- [ ] Button should show "Saving..." state
- [ ] Should show success alert
- [ ] Should return to patient list
- [ ] Verify in Firebase Console:
  - [ ] Note document in Firestore `notes` collection
  - [ ] Canvas snapshot in Storage `notes/{patientId}/{noteId}/snapshot.png`
  - [ ] Canvas data in Storage `notes/{patientId}/{noteId}/canvas.json`

### Cancel Note
- [ ] Start a new session
- [ ] Draw on canvas
- [ ] Click "Cancel Note"
- [ ] Should show confirmation dialog
- [ ] Click "Cancel" in dialog → Stay in session
- [ ] Click "OK" in dialog → Return to patient list without saving

## 4. Responsive Design Testing

### Desktop (1920x1080)
- [ ] Login page centered and properly sized
- [ ] Dashboard layout uses full width appropriately
- [ ] Patient grid shows multiple columns
- [ ] Canvas and side panel fit on screen
- [ ] No horizontal scrolling

### Laptop (1366x768)
- [ ] All layouts still functional
- [ ] Canvas may scroll vertically
- [ ] Side panel readable

### Tablet (768x1024)
- [ ] Login form still centered
- [ ] Patient grid adjusts to 2 columns or 1
- [ ] Session view: canvas and panel may stack

### Mobile (375x667)
- [ ] Login form fills screen appropriately
- [ ] Patient cards stack vertically
- [ ] Session view: canvas and panel stack
- [ ] All buttons remain clickable
- [ ] Side panel scrollable

## 5. Security Testing

### Firestore Security
- [ ] Try accessing Firestore directly without auth → Should fail
- [ ] Try reading another doctor's patients → Should fail
- [ ] Update security rules to test mode
- [ ] Verify access controls work

### Storage Security
- [ ] Try accessing storage files directly → Should require auth
- [ ] Verify only authenticated users can upload
- [ ] Test file size limits

### Authentication Security
- [ ] Cannot access dashboard without login
- [ ] Token expires correctly
- [ ] Logout clears session

## 6. Error Handling Testing

### Network Errors
- [ ] Disconnect internet
- [ ] Try adding patient → Should show error
- [ ] Try loading patients → Should handle gracefully
- [ ] Reconnect and retry → Should work

### Invalid Data
- [ ] Try submitting form with invalid email
- [ ] Try very long text in fields
- [ ] Try special characters in names
- [ ] App should handle gracefully

### Firebase Errors
- [ ] Test with wrong Firebase config → Should show error
- [ ] Test with exceeded quota → Should show error
- [ ] Test with invalid credentials

## 7. Performance Testing

### Loading Times
- [ ] Initial page load < 3 seconds
- [ ] Patient list loads quickly
- [ ] Canvas initializes within 2 seconds
- [ ] OCR completes in reasonable time (< 30s)

### Large Data Sets
- [ ] Add 50+ patients
- [ ] Patient list should still load quickly
- [ ] Scrolling should be smooth
- [ ] Search/filter functionality (if added)

### Canvas Performance
- [ ] Draw complex shapes
- [ ] Canvas should remain responsive
- [ ] Zoom/pan should be smooth

## 8. Browser Compatibility

### Chrome (Recommended)
- [ ] All features work
- [ ] Canvas performs well
- [ ] OCR works correctly

### Firefox
- [ ] All features work
- [ ] Canvas performs well
- [ ] OCR works correctly

### Safari
- [ ] All features work
- [ ] Check canvas compatibility
- [ ] Verify OCR functionality

### Edge
- [ ] All features work
- [ ] Verify all functionality

## 9. Data Validation

### Firestore Data Structure
Check in Firebase Console:

#### Patients Collection
- [ ] Document ID is auto-generated
- [ ] Contains all required fields
- [ ] `doctorId` matches authenticated user
- [ ] `createdAt` and `updatedAt` timestamps exist

#### Notes Collection
- [ ] Document ID is auto-generated
- [ ] `patientId` links to valid patient
- [ ] `doctorId` matches authenticated user
- [ ] `rawText` contains extracted text
- [ ] `extractedData` object has proper structure
- [ ] `createdAt` timestamp exists

#### Storage
- [ ] Files stored in correct path structure
- [ ] Snapshot images are viewable
- [ ] Canvas JSON files are valid
- [ ] File sizes are reasonable

## 10. User Experience Testing

### First-Time User Flow
- [ ] Registration is straightforward
- [ ] Dashboard makes sense without patients
- [ ] "Add New Patient" is obvious
- [ ] Patient form is intuitive
- [ ] Session interface is clear

### Returning User Flow
- [ ] Login is quick
- [ ] Patient list loads immediately
- [ ] Can quickly start a session
- [ ] Notes are easy to save

### Common Tasks
- [ ] Add new patient: < 2 minutes
- [ ] Start session: < 5 seconds
- [ ] Write and save note: < 5 minutes
- [ ] Review patient details: < 10 seconds

## Known Issues & Limitations

Document any issues found:

1. **OCR Accuracy**
   - Depends on handwriting clarity
   - May struggle with cursive
   - Non-English text may not work

2. **Canvas Size**
   - Fixed A4 size may not fit all screens
   - Consider adding zoom functionality

3. **Mobile Experience**
   - Drawing on mobile may be difficult
   - Consider adding mobile-specific UI

4. **Performance**
   - Large canvases may slow down OCR
   - Consider optimizing image size before OCR

## Bug Report Template

If you find a bug, document it:

```
**Bug Title**: [Clear, concise title]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happens]

**Screenshots**: 
[If applicable]

**Environment**:
- Browser: 
- OS: 
- Screen Size: 

**Console Errors**: 
[Any errors in browser console]
```

## Testing Checklist Summary

- [ ] All authentication flows work
- [ ] Can add, view, and manage patients
- [ ] Can start note sessions
- [ ] Canvas drawing works
- [ ] OCR extracts text correctly
- [ ] Medical data extraction works
- [ ] Notes save to Firebase
- [ ] Security rules enforce access control
- [ ] Responsive on all screen sizes
- [ ] Works in all major browsers
- [ ] Performance is acceptable
- [ ] User experience is smooth

## Next Steps After Testing

1. Document all bugs found
2. Prioritize bug fixes
3. Implement missing features
4. Optimize performance issues
5. Improve mobile experience
6. Add additional features:
   - View saved notes
   - Edit patient information
   - Delete patients/notes
   - Search and filter
   - Export to PDF
   - Print functionality

## Production Readiness Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No critical bugs
- [ ] Security rules properly configured
- [ ] Firebase billing enabled
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] HIPAA compliance reviewed (if applicable)
- [ ] Legal review completed
- [ ] User documentation written
- [ ] Training materials prepared
