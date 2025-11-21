import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// VERIFICA que esta configuración sea la correcta de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyDirrUqWvU6i33R4c_5_oisTadeAj6kUj4",
  authDomain: "asteroids-words.firebaseapp.com",
  projectId: "asteroids-words",
  storageBucket: "asteroids-words.firebasestorage.app",
  messagingSenderId: "683708525370",
  appId: "1:683708525370:web:35a32ffe0f8e946e2ebe03",
  measurementId: "G-WTDY9MFX2Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Verificar que se inicialice correctamente
console.log("Firebase app initialized:", app.name);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("✅ Signed in as guest:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("❌ Error signing in anonymously:", error);
    return null;
  }
};
