import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIcyBpklYK-YYM5BmF_WVdQwfEAOoV-Aw",
  authDomain: "remise-noyon.firebaseapp.com",
  projectId: "remise-noyon",
  storageBucket: "remise-noyon.firebasestorage.app",
  messagingSenderId: "883902593638",
  appId: "1:883902593638:web:a90d526703f6f04bcb0ba7",
  measurementId: "G-SXWLTGQZZJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
