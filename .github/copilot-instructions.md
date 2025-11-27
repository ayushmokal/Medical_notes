# Medical Notes Copilot Guide

## Architecture Snapshot
- React 18 + Vite app bootstrapped in `src/main.jsx`, routing handled in `src/App.jsx` with `PrivateRoute`/`PublicRoute` wrappers from `AuthContext`.
- `Dashboard.jsx` is the orchestrator: fetches patients via `patientService`, opens `NoteSession`, and refreshes note history with `notesService`.
- Handwriting capture lives in `NoteSession.jsx`, which instantiates a Fabric v6 canvas (`import { Canvas as FabricCanvas } from 'fabric'`) sized for portrait 8"×11" input; saving a session hits Firestore and Firebase Storage.
- Firebase config is centralized in `src/config/firebase.js` and consumes credentials from `src/config/firebase.config.js`; security rules require every `patients`/`notes` document to carry a `doctorId` matching `request.auth.uid`.

## Data + Services
- `patientService` wraps Firestore CRUD for the `patients` collection; always pass the authenticated UID so security rules allow writes.
- `notesService.addNote` logs verbosely, writes to `notes` with `serverTimestamp`, then stores assets under `notes/{patientId}/{noteId}/` using `saveCanvasSnapshot` and `saveCanvasData`; call `updateNoteWithSnapshotUrl` with the returned download URL so the dashboard renders snapshots.
- `notesService.getNotesByPatient` prefers `orderBy('createdAt','desc')` but falls back to manual sort when the composite index is missing—mirror this pattern if you introduce new queries.
- OCR defaults to Gemini: `geminiOcrService` auto-initializes with `import.meta.env.VITE_GEMINI_API_KEY`, expects the model to return strict JSON, and builds a fallback extractor if parsing fails.
- Legacy Tesseract utilities live in `ocrService.js`; they provide a pattern-based backup but are currently unused.

## AI/OCR Workflow
- `NoteSession.handleExtractText` exports the Fabric canvas as PNG, calls `geminiOcrService.extractFromCanvas`, and stores `fullText` alongside structured vitals/diagnosis/medications; keep responses JSON-friendly because consumers stringify these objects.
- `handleSaveNote` saves both `rawText` (freeform textarea) and `extractedData` from Gemini; ensure new fields remain serializable and <= Firestore document limits.
- Canvas reset/calibration helpers assume portrait orientation and pen input; reuse `calibrateCanvas` logic if you add additional drawing modes to avoid misaligned digitizer coordinates.

## Authentication & State
- `AuthContext` wires Firebase Auth `onAuthStateChanged` to provide `currentUser`; components should call the service methods (`login`, `register`, `logout`) rather than touching Firebase APIs directly.
- Routing assumes `/dashboard` is protected—when adding routes keep them inside the `<AuthProvider>` and wrap private destinations in `PrivateRoute`.

## Environment & Tooling
- Required env vars live in `.env`: `VITE_GEMINI_API_KEY` for OCR and the Firebase credentials in `src/config/firebase.config.js`; `test-gemini.js` (`node test-gemini.js`) validates the Gemini key before running the app.
- Install deps with `npm install`; run the SPA using `npm run dev` (Vite default port 5173) and build with `npm run build` before `firebase deploy --only hosting`.
- Firebase backend artifacts: `firestore.rules`, `storage.rules`, and `firestore.indexes.json` are checked in—update them via the Firebase CLI and keep the repo copies in sync.
- Generated Data Connect clients reside under `src/dataconnect-generated/`; treat this directory as read-only and regenerate with the relevant tooling instead of hand-editing.

## Debugging & Diagnostics
- The services emit console logs (emoji-prefixed) for Firestore and Gemini interactions; rely on these when tracing patient note saves rather than sprinkling new logging.
- When adding async flows, respect existing loading flags (`loading`, `loadingNotes`, `isExtracting`, `isSaving`) so the UI spinners and disabled states stay consistent.

## Deployment Notes
- Hosting is configured via `firebase.json` to serve the Vite build from `dist` with SPA rewrites; any new API endpoints should live in Firebase Functions (`functions/`) if needed.
- Security rules currently allow authenticated reads of patients/notes with client-side filtering; be cautious about adding broad queries that could leak cross-doctor data without matching Firestore rule checks.

👇 Let me know if any section needs more detail or misses a workflow you rely on.
