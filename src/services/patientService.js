import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const patientService = {
  // Add new patient
  addPatient: async (doctorId, patientData) => {
    try {
      const patientsRef = collection(db, 'patients');
      const docRef = await addDoc(patientsRef, {
        ...patientData,
        doctorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, patientId: docRef.id };
    } catch (error) {
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
