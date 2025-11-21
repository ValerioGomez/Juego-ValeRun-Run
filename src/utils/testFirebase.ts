import { auth, db, signInAsGuest } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");

    // 1. Probar autenticación
    const user = await signInAsGuest();
    console.log("✅ Authentication successful:", user?.uid);

    // 2. Probar Firestore (solo si está configurado)
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
  }
};
