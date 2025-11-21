import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Grid,
} from "@mui/material";
import { useSoundManager } from "../sound/SoundManager";

// Tipos locales
type DeviceType = "pc" | "mobile";
type GameMode = "generic" | "custom";

interface WordState {
  id: number;
  text: string;
  position: number;
  speed: number;
  typedLetters: string;
  isActive: boolean;
  initialLeft: number;
  targetX: number;
  targetY: number;
}

interface GameProps {
  playerName: string;
  deviceType: DeviceType;
  gameMode: GameMode;
  customTextWords: string[];
  onGameOver: (score: number) => void;
  onExit: () => void;
}

export const Game: React.FC<GameProps> = ({
  playerName,
  deviceType,
  gameMode,
  customTextWords,
  onGameOver,
  onExit,
}) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [words, setWords] = useState<WordState[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [currentLaser, setCurrentLaser] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [level, setLevel] = useState(1);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);

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

  // Velocidad más lenta
  const getLevelSpeed = useCallback(() => {
    const baseSpeed = deviceType === "pc" ? 0.8 : 0.5;
    return baseSpeed + (level - 1) * 0.2;
  }, [level, deviceType]);

  // Generar palabra aleatoria
  const generateWord = useCallback((): WordState => {
    const wordText =
      gameMode === "custom" && customTextWords.length > 0
        ? customTextWords[Math.floor(Math.random() * customTextWords.length)]
        : sampleWords[Math.floor(Math.random() * sampleWords.length)];

    const initialLeft = Math.random() * 70 + 15;

    return {
      id: Date.now() + Math.random(),
      text: wordText,
      position: 0,
      speed: getLevelSpeed() + Math.random() * 0.3,
      typedLetters: "",
      isActive: false,
      initialLeft,
      targetX: 0,
      targetY: 0,
    };
  }, [gameMode, customTextWords, getLevelSpeed]);

  // ✅ ANIMACIÓN CONSTANTE - LAS PALABRAS SIEMPRE SE MUEVEN
  const gameLoop = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;

    if (!isPaused) {
      setWords((prev) => {
        const updated = prev.map((word) => ({
          ...word,
          position: Math.min(100, word.position + word.speed * deltaTime * 20),
        }));

        if (updated.some((word) => word.position >= 95)) {
          handleGameOver();
        }

        return updated;
      });
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused]);

  const calculateScore = (len: number, speed: number, combo: number) => {
    const base = len * 10;
    const speedMult = 1 + speed / 100;
    const comboMult = 1 + combo * 0.1;
    return Math.floor(base * speedMult * comboMult);
  };

  // Detección de palabra más cercana
  const findClosestWord = (key: string): WordState | null => {
    const candidates = words.filter(
      (word) => word.text.startsWith(key) && word.typedLetters.length === 0
    );

    if (candidates.length === 0) return null;

    return candidates.reduce((closest, current) => {
      return current.position > closest.position ? current : closest;
    });
  };

  // ✅ MANEJO DE INPUT MEJORADO - NO DETIENE EL MOVIMIENTO
  const handleWordInput = (key: string) => {
    setWords((prev) => {
      let destroyed = false;
      let found = false;
      let laserTarget: { x: number; y: number } | null = null;

      const updated = prev
        .map((word) => {
          // ✅ LAS PALABRAS SIGUEN MOVIÉNDOSE MIENTRAS SE ESCRIBEN
          if ((word.isActive || word.text.startsWith(key)) && !found) {
            found = true;
            const next = word.typedLetters.length;

            if (word.text[next] === key) {
              const typed = word.typedLetters + key;

              // ✅ ACTUALIZAR POSICIÓN DEL LÁSER CON LA POSICIÓN ACTUAL
              const laserX = word.initialLeft;
              const laserY = word.position; // Usar posición actual, no fija
              laserTarget = { x: laserX, y: laserY };

              if (typed === word.text) {
                destroyed = true;
                soundManager.play("explosion");
                const pts = calculateScore(word.text.length, word.speed, combo);
                setScore((p) => p + pts);
                setCombo((c) => c + 1);
                setWordsDestroyed((w) => w + 1);
                return null; // Eliminar palabra completada
              } else {
                soundManager.play("laser");
                return {
                  ...word,
                  typedLetters: typed,
                  isActive: true,
                  targetX: laserX,
                  targetY: laserY,
                };
              }
            } else {
              soundManager.play("error");
              setCombo(0);
              return { ...word, isActive: false };
            }
          }
          return word; // ✅ TODAS LAS PALABRAS SIGUEN SU MOVIMIENTO NORMAL
        })
        .filter(Boolean) as WordState[];

      // Láser
      if (laserTarget) {
        setCurrentLaser(laserTarget);
        setTimeout(() => setCurrentLaser(null), 300);
      }

      if (!destroyed && !found) {
        soundManager.play("error");
        setCombo(0);
      }

      return updated;
    });
  };

  // Sistema de niveles
  useEffect(() => {
    if (wordsDestroyed > 0 && wordsDestroyed % 5 === 0) {
      const newLevel = Math.floor(wordsDestroyed / 5) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        soundManager.play("laser");
      }
    }
  }, [wordsDestroyed, level, soundManager]);

  // Pausa solo con botón
  const handlePause = () => {
    if (timeLeft > 0) {
      setIsPaused(!isPaused);
      if (isPaused) {
        soundManager.playMusic();
        lastUpdateTimeRef.current = Date.now();
        animationRef.current = requestAnimationFrame(gameLoop);
      } else {
        soundManager.stopMusic();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }
  };

  const handleGameOver = () => {
    soundManager.stopMusic();
    soundManager.play("explosion");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      onGameOver(score);
    }, 2000);
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  const getWordColor = (word: WordState) => {
    if (word.isActive) return "#00ff00";
    if (word.typedLetters.length > 0) return "#ffff00";
    return "#ffffff";
  };

  // Iniciar juego
  useEffect(() => {
    soundManager.playMusic();
    lastUpdateTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    // Más palabras
    const spawnInterval = setInterval(() => {
      if (!isPaused) {
        setWords((prev) => [...prev, generateWord()]);
      }
    }, 1500 - level * 80);

    return () => {
      clearInterval(spawnInterval);
      soundManager.stopMusic();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [soundManager, generateWord, isPaused, gameLoop, level]);

  // Timer
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  // ✅ SOLO INPUT DE PALABRAS - SIN CONTROLES DE PAUSA
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isPaused || timeLeft <= 0) return;

      if (/^[a-z]$/i.test(event.key)) {
        const key = event.key.toLowerCase();
        setCurrentInput((prev) => prev + key);

        setWords((prev) => {
          const hasActive = prev.some((w) => w.isActive);
          if (!hasActive) {
            const closest = findClosestWord(key);
            if (closest) {
              return prev.map((w) =>
                w.id === closest.id
                  ? { ...w, isActive: true }
                  : { ...w, isActive: false }
              );
            }
          }
          return prev;
        });

        handleWordInput(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPaused, timeLeft, words]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Overlay de pausa */}
      {isPaused && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.95)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "white",
          }}
        >
          <Typography variant="h2" gutterBottom>
            ⏸️ JUEGO PAUSADO
          </Typography>
          <Typography variant="h5" gutterBottom>
            Puntuación Actual: {score}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
            Nivel: {level} | Palabras Destruidas: {wordsDestroyed}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handlePause}
            sx={{ mb: 2, backgroundColor: "#00c853", minWidth: 200 }}
          >
            ▶️ Continuar Juego
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={onExit}
            sx={{ minWidth: 200, color: "white", borderColor: "white" }}
          >
            🏠 Salir al Menú
          </Button>
        </Box>
      )}

      {/* Header */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography variant="h6" color="white">
              Jugador: <strong>{playerName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modo: {gameMode} | Nivel: {level}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {score} PTS
            </Typography>
            <Typography variant="body1" color="yellow">
              Combo: x{combo}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              Destruidas: {wordsDestroyed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Velocidad: {getLevelSpeed().toFixed(1)}x
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "right" }}>
            <Typography
              variant="h5"
              color={timeLeft <= 30 ? "error" : "primary"}
              fontWeight="bold"
            >
              ⏱️ {formatTime(timeLeft)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(timeLeft / 120) * 100}
              color={timeLeft <= 30 ? "error" : "primary"}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Área de juego */}
      <Paper
        elevation={8}
        sx={{
          position: "relative",
          height: "500px",
          background: "linear-gradient(180deg, #000033, #001122)",
          border: "3px solid #00ff00",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Nave */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "2rem",
            zIndex: 10,
          }}
        >
          🚀
        </Box>

        {/* ✅ LÁSER QUE SIGUE A LA PALABRA EN MOVIMIENTO */}
        {currentLaser && (
          <Box
            sx={{
              position: "absolute",
              bottom: 60,
              left: "50%",
              width: "3px",
              height: `calc(${100 - currentLaser.y}% - 60px)`,
              background:
                "linear-gradient(to top, #00ffff, #0066ff, transparent)",
              transform: `translateX(-50%) rotate(${
                Math.atan2(currentLaser.y - 80, currentLaser.x - 50) *
                (180 / Math.PI)
              }deg)`,
              transformOrigin: "bottom center",
              animation: "laserBeam 0.3s ease-out",
              zIndex: 5,
              "@keyframes laserBeam": {
                "0%": { opacity: 0, transform: "translateX(-50%) scaleY(0)" },
                "50%": { opacity: 1, transform: "translateX(-50%) scaleY(1)" },
                "100%": { opacity: 0, transform: "translateX(-50%) scaleY(1)" },
              },
            }}
          />
        )}

        {/* ✅ PALABRAS QUE SIGUEN MOVIÉNDOSE MIENTRAS SE ESCRIBEN */}
        {words.map((word) => (
          <Box
            key={word.id}
            sx={{
              position: "absolute",
              left: `${word.initialLeft}%`,
              top: `${word.position}%`,
              transform: "translateX(-50%)",
              color: getWordColor(word),
              fontFamily: "monospace",
              fontSize: deviceType === "pc" ? "1.5rem" : "1.2rem",
              fontWeight: "bold",
              textShadow: `
                0 0 10px currentColor,
                0 0 20px ${word.isActive ? "#00ff00" : "transparent"}
              `,
              transition: "none", // ✅ SIN TRANSICIÓN PARA MOVIMIENTO CONSTANTE
              zIndex: 8,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: word.isActive
                ? "rgba(0, 255, 0, 0.1)"
                : "transparent",
              border: word.isActive ? "1px solid #00ff00" : "none",
            }}
          >
            {/* ✅ LETRAS ESCRITAS DESAPARECEN Y LAS RESTANTES SE VEN */}
            <span
              style={{
                color: "#ffff00",
                textDecoration:
                  word.typedLetters.length > 0 ? "line-through" : "none",
                opacity: word.typedLetters.length > 0 ? 0.7 : 1,
              }}
            >
              {word.typedLetters}
            </span>
            <span style={{ opacity: 0.9 }}>
              {word.text.slice(word.typedLetters.length)}
            </span>
          </Box>
        ))}

        {/* Instrucciones */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,.7)",
            fontSize: "0.8rem",
            textAlign: "center",
            zIndex: 5,
          }}
        >
          Nivel {level} | Usa el teclado para destruir palabras
        </Box>
      </Paper>

      {/* Controles */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePause}
            disabled={timeLeft <= 0}
          >
            {isPaused ? "▶️ Continuar" : "⏸️ Pausar"}
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Button variant="outlined" color="error" fullWidth onClick={onExit}>
            🏠 Salir al Menú
          </Button>
        </Grid>
      </Grid>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent>
              <Typography color="text.secondary">Palabras Activas</Typography>
              <Typography variant="h6" color="primary">
                {words.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent>
              <Typography color="text.secondary">Input Actual</Typography>
              <Typography
                variant="h6"
                color="success.main"
                fontFamily="monospace"
              >
                {currentInput || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent>
              <Typography color="text.secondary">Velocidad Nivel</Typography>
              <Typography variant="h6" color="warning.main">
                {getLevelSpeed().toFixed(1)}x
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
