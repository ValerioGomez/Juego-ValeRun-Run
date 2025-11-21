import React, { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { Button, Typography, Container, Box } from "@mui/material";

export const GameOver: React.FC = () => {
  const { finalScore, saveCurrentScore, setScreen, resetGame } = useGameStore(); // <-- Usar Zustand

  // Guardar la puntuación automáticamente al entrar en esta pantalla
  useEffect(() => {
    saveCurrentScore();
  }, [saveCurrentScore]);

  const handleRestart = () => {
    resetGame();
    setScreen("deviceSelection"); // Volver a la selección de dispositivo para un nuevo juego
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4">
          Game Over
        </Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Tu Puntuación: {finalScore}
        </Typography>
        <Box sx={{ mt: 4, width: "100%" }}>
          <Button
            variant="outlined"
            onClick={() => setScreen("leaderboard")}
            fullWidth
            sx={{ mb: 2 }}
          >
            Ver SALÓN DE LA FAMA
          </Button>
          <Button
            variant="contained"
            onClick={handleRestart}
            fullWidth
            sx={{ mb: 2 }}
          >
            Jugar de Nuevo
          </Button>
          <Button
            variant="outlined"
            onClick={() => setScreen("menu")}
            fullWidth
          >
            Menú Principal
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
