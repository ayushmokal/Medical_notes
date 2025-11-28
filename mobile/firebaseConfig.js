import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAglWqPmrrXU5foQaNuVsVSdI9WWZiHKCk",
  authDomain: "medical-notes-system.firebaseapp.com",
  projectId: "medical-notes-system",
  storageBucket: "medical-notes-system.firebasestorage.app",
  messagingSenderId: "221922593535",
  appId: "1:221922593535:web:01f102136c8410cc9edaca",
  measurementId: "G-ETEE1KP5WL"
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
