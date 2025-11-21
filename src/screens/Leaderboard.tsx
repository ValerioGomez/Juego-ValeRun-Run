import React, { useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useGameStore } from "../store/gameStore";

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const { highScores, isLoadingScores, fetchHighScores } = useGameStore();

  useEffect(() => {
    fetchHighScores();
  }, [fetchHighScores]);

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
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" gutterBottom align="center">
            Leaderboard
          </Typography>

          {isLoadingScores && (
            <Typography align="center">Cargando...</Typography>
          )}

          {!isLoadingScores && highScores.length === 0 && (
            <Typography align="center" sx={{ mt: 2 }}>
              No hay puntuaciones aún. ¡Sé el primero!
            </Typography>
          )}

          {!isLoadingScores && highScores.length > 0 && (
            <List sx={{ width: "100%", mt: 2 }}>
              {highScores.map((score, index) => (
                <ListItem key={`${score.name}-${index}`}>
                  <ListItemText
                    primary={`${index + 1}. ${score.name}`}
                    secondary={`Puntos: ${score.score}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Button onClick={onBack} fullWidth sx={{ mt: 3 }} variant="outlined">
            Volver al Menú
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
