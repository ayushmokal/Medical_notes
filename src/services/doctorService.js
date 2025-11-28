import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const doctorService = {
    // Create or Update Doctor Profile
    saveDoctorProfile: async (uid, profileData) => {
        try {
            const doctorRef = doc(db, 'doctors', uid);
            await setDoc(doctorRef, {
                ...profileData,
                updatedAt: serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error saving doctor profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Get Doctor Profile
    getDoctorProfile: async (uid) => {
        try {
            const doctorRef = doc(db, 'doctors', uid);
            const doctorDoc = await getDoc(doctorRef);

            if (doctorDoc.exists()) {
                return { success: true, profile: doctorDoc.data() };
            } else {
                return { success: false, error: 'Profile not found' };
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            return { success: false, error: error.message };
        }
    }
};
