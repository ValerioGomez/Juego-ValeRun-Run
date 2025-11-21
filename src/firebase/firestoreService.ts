import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface HighScore {
  name: string;
  score: number;
  createdAt: Timestamp;
}

const HIGHSCORES_COLLECTION = "highscores";

export const saveHighScore = async (
  name: string,
  score: number
): Promise<void> => {
  try {
    // Validar datos antes de enviar
    if (!name || name.trim() === "") {
      throw new Error("El nombre no puede estar vacío");
    }

    if (typeof score !== "number" || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    const docRef = await addDoc(collection(db, HIGHSCORES_COLLECTION), {
      name: name.trim(),
      score: score,
      createdAt: Timestamp.now(),
    });

    console.log("High score saved with ID: ", docRef.id);
  } catch (error: any) {
    console.error("Error adding document: ", error);

    // Mensajes de error más específicos
    if (error.code === "permission-denied") {
      throw new Error("Permisos denegados. Verifica las reglas de Firestore.");
    } else if (error.code === "unavailable") {
      throw new Error("Firestore no está disponible. Verifica tu conexión.");
    } else {
      throw new Error("Error al guardar la puntuación: " + error.message);
    }
  }
};

export const getTopHighScores = async (
  limitCount: number = 10
): Promise<HighScore[]> => {
  try {
    const q = query(
      collection(db, HIGHSCORES_COLLECTION),
      orderBy("score", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.name || "Anónimo",
        score: data.score || 0,
        createdAt: data.createdAt || Timestamp.now(),
      } as HighScore;
    });
  } catch (error: any) {
    console.error("Error getting documents: ", error);

    // En caso de error, retornar array vacío para que el juego continúe
    return [];
  }
};
