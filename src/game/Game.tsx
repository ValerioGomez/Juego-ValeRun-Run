import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Grid, // ✅ Cambiar a Grid normal
  LinearProgress,
} from "@mui/material";
import { useSoundManager } from "../sound/SoundManager";

// Tipos locales
type DeviceType = "pc" | "mobile";
type GameMode = "generic" | "custom";

interface WordState {
  id: number;
  text: string;
  position: number; // porcentaje de avance (0-100)
  speed: number;
  typedLetters: string;
  isActive: boolean;
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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos
  const [words, setWords] = useState<WordState[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentInput, setCurrentInput] = useState("");

  const soundManager = useSoundManager();

  // Palabras de ejemplo para el modo genérico
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
  ];

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
      speed: 1 + Math.random() * 2,
      typedLetters: "",
      isActive: false,
    };
  }, [gameMode, customTextWords]);

  // Iniciar juego
  useEffect(() => {
    soundManager.playMusic();

    // Generar primera palabra
    setTimeout(() => {
      setWords([generateWord()]);
    }, 1000);

    // Spawn de palabras cada 3 segundos
    const spawnInterval = setInterval(() => {
      if (!isPaused) {
        setWords((prev) => [...prev, generateWord()]);
      }
    }, 3000);

    return () => {
      clearInterval(spawnInterval);
      soundManager.stopMusic();
    };
  }, [soundManager, generateWord, isPaused]);

  // Timer del juego
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

  // Actualizar posición de palabras
  useEffect(() => {
    if (isPaused) return;

    const moveInterval = setInterval(() => {
      setWords((prev) => {
        const updatedWords = prev.map((word) => ({
          ...word,
          position: Math.min(100, word.position + word.speed),
        }));

        // Verificar si alguna palabra llegó al final
        const wordReachedEnd = updatedWords.some((word) => word.position >= 95);
        if (wordReachedEnd) {
          handleGameOver();
        }

        return updatedWords;
      });
    }, 100);

    return () => clearInterval(moveInterval);
  }, [isPaused]);

  // Manejar input del teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isPaused || timeLeft <= 0) return;

      if (event.key === "Escape") {
        handlePause();
        return;
      }

      if (event.key === "p" || event.key === "P") {
        handlePause();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        const key = event.key.toLowerCase();
        setCurrentInput((prev) => prev + key);
        handleWordInput(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPaused, timeLeft, words]);

  const handleWordInput = (key: string) => {
    setWords((prev) => {
      let wordDestroyed = false;
      let activeWordFound = false;

      const updatedWords = prev
        .map((word) => {
          // Si la palabra está activa o empieza con la letra presionada
          if (
            (word.isActive || word.text.startsWith(key)) &&
            !activeWordFound
          ) {
            activeWordFound = true;

            // Verificar si es la letra correcta
            const nextLetterIndex = word.typedLetters.length;
            if (word.text[nextLetterIndex] === key) {
              const newTypedLetters = word.typedLetters + key;

              // Si la palabra está completa
              if (newTypedLetters === word.text) {
                wordDestroyed = true;
                soundManager.play("explosion");
                const points = calculateScore(
                  word.text.length,
                  word.speed,
                  combo
                );
                setScore((prevScore) => prevScore + points);
                setCombo((prevCombo) => prevCombo + 1);
                return null; // Eliminar palabra
              } else {
                soundManager.play("laser");
                return {
                  ...word,
                  typedLetters: newTypedLetters,
                  isActive: true,
                };
              }
            } else {
              soundManager.play("error");
              setCombo(0);
              return { ...word, isActive: false };
            }
          }
          return { ...word, isActive: false };
        })
        .filter(Boolean) as WordState[];

      if (!wordDestroyed && !activeWordFound) {
        soundManager.play("error");
        setCombo(0);
      }

      return updatedWords;
    });
  };

  const calculateScore = (
    wordLength: number,
    speed: number,
    currentCombo: number
  ): number => {
    const baseScore = wordLength * 10;
    const speedMultiplier = 1 + speed / 100;
    const comboMultiplier = 1 + currentCombo * 0.1;
    return Math.floor(baseScore * speedMultiplier * comboMultiplier);
  };

  const handlePause = () => {
    if (timeLeft > 0) {
      setIsPaused(!isPaused);
      if (isPaused) {
        soundManager.playMusic();
      } else {
        soundManager.stopMusic();
      }
    }
  };

  const handleGameOver = () => {
    soundManager.stopMusic();
    soundManager.play("explosion");
    setTimeout(() => {
      onGameOver(score);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getWordColor = (word: WordState) => {
    if (word.isActive) return "#00ff00";
    if (word.typedLetters.length > 0) return "#ffff00";
    return "#ffffff";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Overlay de Pausa */}
      {isPaused && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "white",
          }}
        >
          <Typography variant="h2" gutterBottom>
            ⏸️ PAUSADO
          </Typography>
          <Typography variant="h5" gutterBottom>
            Presiona P para reanudar
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onExit}
            sx={{ mt: 2, backgroundColor: "#ff4444" }}
          >
            Salir al Menú
          </Button>
        </Box>
      )}

      {/* Header del Juego */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white">
              Jugador: <strong>{playerName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modo: {gameMode} | Dispositivo: {deviceType}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {score} PTS
            </Typography>
            <Typography variant="body1" color="yellow">
              Combo: x{combo}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
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

      {/* Área de Juego */}
      <Paper
        elevation={8}
        sx={{
          position: "relative",
          height: "500px",
          background: "linear-gradient(180deg, #000033 0%, #001122 100%)",
          border: "3px solid #00ff00",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Nave (en la parte inferior) */}
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

        {/* Palabras cayendo */}
        {words.map((word) => (
          <Box
            key={word.id}
            sx={{
              position: "absolute",
              left: `${Math.random() * 80 + 10}%`,
              top: `${word.position}%`,
              transform: "translateX(-50%)",
              color: getWordColor(word),
              fontFamily: "monospace",
              fontSize: deviceType === "pc" ? "1.5rem" : "1.2rem",
              fontWeight: "bold",
              textShadow: "0 0 10px currentColor",
              zIndex: 5,
              transition: "top 0.1s linear",
            }}
          >
            <span style={{ color: "#ffff00" }}>{word.typedLetters}</span>
            <span style={{ opacity: 0.7 }}>
              {word.text.slice(word.typedLetters.length)}
            </span>
          </Box>
        ))}

        {/* Láser (efecto visual) */}
        {currentInput && (
          <Box
            sx={{
              position: "absolute",
              bottom: 60,
              left: "50%",
              width: "2px",
              height: "70%",
              background: "linear-gradient(to top, #00ffff, transparent)",
              animation: "laser 0.3s ease-out",
              zIndex: 2,
              "@keyframes laser": {
                "0%": { height: "0%", opacity: 1 },
                "100%": { height: "70%", opacity: 0 },
              },
            }}
          />
        )}

        {/* Instrucciones */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.8rem",
            textAlign: "center",
          }}
        >
          Presiona P para pausar | ESC para salir
        </Box>
      </Paper>

      {/* Panel de Control */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePause}
            disabled={timeLeft <= 0}
          >
            {isPaused ? "Reanudar (P)" : "Pausar (P)"}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" color="error" fullWidth onClick={onExit}>
            Salir (ESC)
          </Button>
        </Grid>
      </Grid>

      {/* Estadísticas en Tiempo Real */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Palabras Activas
              </Typography>
              <Typography variant="h6" color="primary">
                {words.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Input Actual
              </Typography>
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
          <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Velocidad
              </Typography>
              <Typography variant="h6" color="warning.main">
                {deviceType === "pc" ? "Alta" : "Media"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
