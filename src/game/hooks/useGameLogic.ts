import { useState, useCallback, useRef, useEffect } from "react";
import { useSoundManager } from "../../sound/SoundManager";

export interface WordState {
  id: number;
  text: string;
  position: number;
  speed: number;
  typedLetters: string;
  isActive: boolean;
  initialLeft: number;
}

export interface BulletState {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number; // 0 to 1
  color: string;
}

export interface GameStats {
  score: number;
  combo: number;
  level: number;
  wordsDestroyed: number;
  lives: number;
  timeLeft: number;
}

export const useGameLogic = (
  deviceType: "pc" | "mobile",
  gameMode: "generic" | "custom",
  customTextWords: string[],
  onGameOver: (score: number) => void
) => {
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    level: 1,
    wordsDestroyed: 0,
    lives: 3,
    timeLeft: 120,
  });

  const [words, setWords] = useState<WordState[]>([]);
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const soundManager = useSoundManager();
  const animationRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Palabras de ejemplo
  const sampleWords = [
    "javascript",
    "react",
    "typescript",
    "firebase",
    "componente",
    "estado",
    "funcion",
    "variable",
    "arreglo",
    "objeto",
    "clase",
    "modulo",
    "importar",
    "exportar",
    "interfaz",
    "propiedad",
    "metodo",
    "desarrollo",
    "aplicacion",
    "navegador",
    "servidor",
    "cliente",
    "frontend",
    "backend",
    "database",
    "consulta",
    "documento",
  ];

  // Velocidad basada en nivel
  const getLevelSpeed = useCallback(() => {
    const baseSpeed = deviceType === "pc" ? 0.8 : 0.5;
    return baseSpeed + (stats.level - 1) * 0.2;
  }, [stats.level, deviceType]);

  // Generar palabra aleatoria
  const generateWord = useCallback((): WordState => {
    const wordText =
      gameMode === "custom" && customTextWords.length > 0
        ? customTextWords[Math.floor(Math.random() * customTextWords.length)]
        : sampleWords[Math.floor(Math.random() * sampleWords.length)];

    return {
      id: Date.now() + Math.random(),
      text: wordText,
      position: 0,
      speed: getLevelSpeed() + Math.random() * 0.3,
      typedLetters: "",
      isActive: false,
      initialLeft: Math.random() * 70 + 15,
    };
  }, [gameMode, customTextWords, getLevelSpeed]);

  // Calcular puntuación
  const calculateScore = useCallback(
    (len: number, speed: number, combo: number) => {
      const base = len * 10;
      const speedMult = 1 + speed / 100;
      const comboMult = 1 + combo * 0.1;
      return Math.floor(base * speedMult * comboMult);
    },
    []
  );

  // Crear bala
  const createBullet = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const newBullet: BulletState = {
        id: Date.now() + Math.random(),
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        color: "#00ffff",
      };

      setBullets((prev) => [...prev, newBullet]);

      // Remover bala después de la animación
      setTimeout(() => {
        setBullets((prev) => prev.filter((b) => b.id !== newBullet.id));
      }, 500);
    },
    []
  );

  // Encontrar palabra más cercana
  const findClosestWord = useCallback(
    (key: string): WordState | null => {
      const candidates = words.filter(
        (word) => word.text.startsWith(key) && word.typedLetters.length === 0
      );

      if (candidates.length === 0) return null;

      return candidates.reduce((closest, current) => {
        return current.position > closest.position ? current : closest;
      });
    },
    [words]
  );

  // Manejar input del teclado
  const handleWordInput = useCallback(
    (key: string) => {
      setWords((prev) => {
        let destroyed = false;
        let found = false;

        const updated = prev
          .map((word) => {
            if ((word.isActive || word.text.startsWith(key)) && !found) {
              found = true;
              const next = word.typedLetters.length;

              if (word.text[next] === key) {
                const typed = word.typedLetters + key;

                // Crear bala desde la nave hasta la palabra
                createBullet(50, 85, word.initialLeft, word.position);

                if (typed === word.text) {
                  destroyed = true;
                  soundManager.play("explosion");
                  const pts = calculateScore(
                    word.text.length,
                    word.speed,
                    stats.combo
                  );

                  setStats((prevStats) => ({
                    ...prevStats,
                    score: prevStats.score + pts,
                    combo: prevStats.combo + 1,
                    wordsDestroyed: prevStats.wordsDestroyed + 1,
                  }));

                  return null;
                } else {
                  soundManager.play("laser");
                  return {
                    ...word,
                    typedLetters: typed,
                    isActive: true,
                  };
                }
              } else {
                soundManager.play("error");
                setStats((prevStats) => ({ ...prevStats, combo: 0 }));
                return { ...word, isActive: false, typedLetters: "" };
              }
            }
            return word;
          })
          .filter(Boolean) as WordState[];

        if (!destroyed && !found) {
          soundManager.play("error");
          setStats((prevStats) => ({ ...prevStats, combo: 0 }));
        }

        return updated;
      });
    },
    [soundManager, calculateScore, stats.combo, createBullet]
  );

  // Game over
  const handleGameOver = useCallback(() => {
    soundManager.stopMusic();
    soundManager.play("explosion");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      onGameOver(stats.score);
    }, 2000);
  }, [soundManager, stats.score, onGameOver]);

  // Loop principal del juego
  const gameLoop = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;

    // Actualizar palabras
    setWords((prev) => {
      const updatedWords = prev.map((word) => ({
        ...word,
        position: Math.min(100, word.position + word.speed * deltaTime * 20),
      }));

      const wordsThatPassed = updatedWords.filter(
        (word) => word.position >= 100
      ).length;

      if (wordsThatPassed > 0) {
        setStats((prevStats) => ({
          ...prevStats,
          lives: Math.max(0, prevStats.lives - wordsThatPassed),
        }));
      }

      return updatedWords.filter((word) => word.position < 100);
    });

    // Actualizar balas
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          progress: Math.min(1, bullet.progress + deltaTime * 3), // Velocidad de la bala
        }))
        .filter((bullet) => bullet.progress < 1)
    );

    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Sistema de niveles
  useEffect(() => {
    if (stats.wordsDestroyed > 0 && stats.wordsDestroyed % 5 === 0) {
      const newLevel = Math.floor(stats.wordsDestroyed / 5) + 1;
      if (newLevel > stats.level) {
        setStats((prevStats) => ({ ...prevStats, level: newLevel }));
        soundManager.play("laser");
      }
    }
  }, [stats.wordsDestroyed, stats.level, soundManager]);

  // Game over por vidas
  useEffect(() => {
    if (stats.lives <= 0) {
      handleGameOver();
    }
  }, [stats.lives, handleGameOver]);

  // Game over por tiempo
  useEffect(() => {
    if (stats.timeLeft <= 0) {
      handleGameOver();
    }
  }, [stats.timeLeft, handleGameOver]);

  // Inicializar juego
  useEffect(() => {
    soundManager.playMusic();
    lastUpdateTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    // Spawn de palabras
    const spawnInterval = setInterval(() => {
      setWords((prev) => [...prev, generateWord()]);
    }, 1500 - stats.level * 80);

    // Timer
    const timer = setInterval(() => {
      setStats((prevStats) => ({
        ...prevStats,
        timeLeft: Math.max(0, prevStats.timeLeft - 1),
      }));
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
      soundManager.stopMusic();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [soundManager, gameLoop, generateWord, stats.level]);

  return {
    stats,
    words,
    bullets,
    currentInput,
    setCurrentInput,
    handleWordInput,
    findClosestWord,
    getLevelSpeed,
    setStats: (updater: (prev: GameStats) => GameStats) => setStats(updater),
  };
};
