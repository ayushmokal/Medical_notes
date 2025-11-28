import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../config/firebase';
import { firebaseConfig } from '../config/firebase.config';

export const patientService = {
  // Add new patient
  // Add new patient
  addPatient: async (doctorId, patientData) => {
    let secondaryApp = null;
    try {
      // 1. Create a secondary Firebase app to create the user without logging out the doctor
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        patientData.email,
        patientData.password
      );
      const uid = userCredential.user.uid;

      // 3. Prepare data for Firestore (remove password)
      const { password, ...dataToSave } = patientData;

      // 4. Save to Firestore using the Auth UID as the document ID
      const patientRef = doc(db, 'patients', uid);
      await setDoc(patientRef, {
        ...dataToSave,
        doctorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 5. Clean up
      await deleteApp(secondaryApp);

      return { success: true, patientId: uid };
    } catch (error) {
      if (secondaryApp) {
        await deleteApp(secondaryApp).catch(console.error);
      }
      console.error("Error adding patient:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all patients for a doctor
  getPatientsByDoctor: async (doctorId) => {
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);

      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, patients };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get single patient
  getPatient: async (patientId) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const patientDoc = await getDoc(patientRef);

      if (patientDoc.exists()) {
        return { success: true, patient: { id: patientDoc.id, ...patientDoc.data() } };
      } else {
        return { success: false, error: 'Patient not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        ...patientData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
