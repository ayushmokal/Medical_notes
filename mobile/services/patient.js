import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const getPatientByEmail = async (email) => {
    try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const patientDoc = querySnapshot.docs[0];
            return { id: patientDoc.id, ...patientDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching patient by email:", error);
        return null;
    }
};

export const getDoctorDetails = async (doctorId) => {
    try {
        const doctorRef = doc(db, 'doctors', doctorId);
        const doctorDoc = await getDoc(doctorRef);

        if (doctorDoc.exists()) {
            return { id: doctorDoc.id, ...doctorDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        return null;
    }
};

export const getPatientSessions = async (patientId) => {
    try {
        const notesRef = collection(db, 'notes');
        const q = query(notesRef, where('patientId', '==', patientId));
        const querySnapshot = await getDocs(q);

        const sessions = [];
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });

        // Sort by date (newest first)
        sessions.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        return sessions;
    } catch (error) {
        console.error("Error fetching patient sessions:", error);
        return [];
    }
};
