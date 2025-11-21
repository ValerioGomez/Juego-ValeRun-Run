import React, { useState, useEffect } from "react";
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
import { useGameLogic } from "./hooks/useGameLogic";

interface GameProps {
  playerName: string;
  deviceType: "pc" | "mobile";
  gameMode: "generic" | "custom";
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
  const [isPaused, setIsPaused] = useState(false);

  const soundManager = useSoundManager();
  const {
    stats,
    words,
    bullets,
    currentInput,
    setCurrentInput,
    handleWordInput,
    findClosestWord,
    getLevelSpeed,
    setStats,
  } = useGameLogic(deviceType, gameMode, customTextWords, onGameOver);

  // Pausa solo con botón
  const handlePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      soundManager.playMusic();
    } else {
      soundManager.stopMusic();
    }
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  const getWordColor = (word: any) => {
    if (word.isActive) return "#00ff00";
    if (word.typedLetters.length > 0) return "#ffff00";
    return "#ffffff";
  };

  // Input de teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isPaused || stats.timeLeft <= 0) return;

      if (/^[a-z]$/i.test(event.key)) {
        const key = event.key.toLowerCase();
        setCurrentInput((prev) => prev + key);

        // Activar palabra más cercana si no hay activa
        const hasActive = words.some((w) => w.isActive);
        if (!hasActive) {
          const closest = findClosestWord(key);
          if (closest) {
            // Actualizar palabras para marcar la más cercana como activa
            const updatedWords = words.map((w) =>
              w.id === closest.id
                ? { ...w, isActive: true }
                : { ...w, isActive: false }
            );
            // Necesitaríamos una forma de actualizar las palabras aquí
            // Por simplicidad, manejamos esto en el hook
          }
        }

        handleWordInput(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isPaused,
    stats.timeLeft,
    words,
    findClosestWord,
    handleWordInput,
    setCurrentInput,
  ]);

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
            Puntuación Actual: {stats.score}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
            Nivel: {stats.level} | Palabras Destruidas: {stats.wordsDestroyed}
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
              Modo: {gameMode} | Nivel: {stats.level}
            </Typography>
            <Typography variant="h6" color="error.main" sx={{ mt: 1 }}>
              Vidas: {"❤️".repeat(stats.lives)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.score} PTS
            </Typography>
            <Typography variant="body1" color="yellow">
              Combo: x{stats.combo}
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              Destruidas: {stats.wordsDestroyed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Velocidad: {getLevelSpeed().toFixed(1)}x
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: "right" }}>
            <Typography
              variant="h5"
              color={stats.timeLeft <= 30 ? "error" : "primary"}
              fontWeight="bold"
            >
              ⏱️ {formatTime(stats.timeLeft)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.timeLeft / 120) * 100}
              color={stats.timeLeft <= 30 ? "error" : "primary"}
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

        {/* ✅ BALAS CON RASTRO DE LÁSER */}
        {bullets.map((bullet) => {
          const currentX =
            bullet.startX + (bullet.endX - bullet.startX) * bullet.progress;
          const currentY =
            bullet.startY + (bullet.endY - bullet.startY) * bullet.progress;

          return (
            <Box
              key={bullet.id}
              sx={{
                position: "absolute",
                left: `${currentX}%`,
                top: `${currentY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 6,
              }}
            >
              {/* Bala principal */}
              <Box
                sx={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: bullet.color,
                  borderRadius: "50%",
                  boxShadow: `0 0 10px ${bullet.color}, 0 0 20px ${bullet.color}`,
                }}
              />

              {/* Rastro del láser */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "50%",
                  left: "50%",
                  width: "2px",
                  height: `calc(100% * ${bullet.progress})`,
                  background: `linear-gradient(to top, ${bullet.color}80, transparent)`,
                  transform: "translateX(-50%)",
                  transformOrigin: "bottom",
                }}
              />
            </Box>
          );
        })}

        {/* Palabras */}
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
              zIndex: 8,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: word.isActive
                ? "rgba(0, 255, 0, 0.1)"
                : "transparent",
              border: word.isActive ? "1px solid #00ff00" : "none",
            }}
          >
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
          Nivel {stats.level} | Usa el teclado para destruir palabras
        </Box>
      </Paper>

      {/* Controles */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePause}
            disabled={stats.timeLeft <= 0}
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
