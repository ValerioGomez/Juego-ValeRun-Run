import React from "react";
import { useGameStore } from "../store/gameStore";
import { Button, Typography, Container, Box } from "@mui/material";

export const MenuScreen: React.FC = () => {
  const { playerName, setScreen } = useGameStore(); // <-- Usar Zustand

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
          Menú Principal
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Jugador: {playerName}
        </Typography>
        <Box sx={{ mt: 4, width: "100%" }}>
          <Button
            variant="contained"
            onClick={() => setScreen("deviceSelection")}
            fullWidth
            sx={{ mb: 2 }}
          >
            {" "}
            {/* <-- Usar Zustand */}
            Jugar
          </Button>
          <Button
            variant="outlined"
            onClick={() => setScreen("leaderboard")}
            fullWidth
          >
            {" "}
            {/* <-- Usar Zustand */}
            Ver Leaderboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
