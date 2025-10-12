import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export const notesService = {
  // Add new note
  addNote: async (patientId, doctorId, noteData) => {
    try {
      console.log('🔥 Firestore: Adding note to collection "notes"');
      console.log('📋 Patient ID:', patientId);
      console.log('👨‍⚕️ Doctor ID:', doctorId);
      console.log('📝 Note data:', noteData);
      
      const notesRef = collection(db, 'notes');
      const docRef = await addDoc(notesRef, {
        patientId,
        doctorId,
        ...noteData,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Note added successfully with ID:', docRef.id);
      return { success: true, noteId: docRef.id };
    } catch (error) {
      console.error('❌ Firestore error adding note:', error);
      return { success: false, error: error.message };
    }
  },

  // Get notes for a patient
  getNotesByPatient: async (patientId) => {
    try {
      console.log('🔍 Firestore: Querying notes for patient:', patientId);
      const notesRef = collection(db, 'notes');
      
      // Try with orderBy first (requires index)
      try {
        const q = query(
          notesRef, 
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const notes = [];
        querySnapshot.forEach((doc) => {
          notes.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('✅ Found', notes.length, 'notes for patient:', patientId);
        console.log('📋 Notes:', notes);
        return { success: true, notes };
      } catch (indexError) {
        // If index error, fall back to query without orderBy
        console.warn('⚠️ Index not ready, using fallback query without orderBy');
        console.log('Index error:', indexError.message);
        
        const qSimple = query(
          notesRef, 
          where('patientId', '==', patientId)
        );
        const querySnapshot = await getDocs(qSimple);
        
        const notes = [];
        querySnapshot.forEach((doc) => {
          notes.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort manually by createdAt in descending order
        notes.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.sessionDate || 0;
          const timeB = b.createdAt?.seconds || b.sessionDate || 0;
          return timeB - timeA;
        });
        
        console.log('✅ Found', notes.length, 'notes (sorted manually):', patientId);
        console.log('📋 Notes:', notes);
        return { success: true, notes };
      }
    } catch (error) {
      console.error('❌ Firestore error getting notes:', error);
      return { success: false, error: error.message };
    }
  },

  // Save canvas snapshot to storage
  saveCanvasSnapshot: async (patientId, noteId, snapshotData) => {
    try {
      const storageRef = ref(storage, `notes/${patientId}/${noteId}/snapshot.png`);
      await uploadString(storageRef, snapshotData, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Save canvas JSON data
  saveCanvasData: async (patientId, noteId, canvasData) => {
    try {
      const storageRef = ref(storage, `notes/${patientId}/${noteId}/canvas.json`);
      await uploadString(storageRef, JSON.stringify(canvasData));
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update note with snapshot URL
  updateNoteWithSnapshotUrl: async (noteId, snapshotUrl) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        snapshotUrl: snapshotUrl
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating note with snapshot URL:', error);
      return { success: false, error: error.message };
    }
  }
};
