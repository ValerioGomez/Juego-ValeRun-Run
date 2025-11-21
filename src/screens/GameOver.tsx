import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import { useGameStore } from "../store/gameStore";

interface GameOverProps {
  score: number;
  playerName: string;
  onRestart: () => void;
  onMenu: () => void;
  onViewLeaderboard: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  playerName,
  onRestart,
  onMenu,
  onViewLeaderboard,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { saveCurrentScore } = useGameStore();

  const handleSaveScore = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveCurrentScore();
      setSaveSuccess(true);

      // Redirigir automáticamente después de guardar
      setTimeout(() => {
        onViewLeaderboard();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving score:", error);
      setSaveError(error.message || "Error desconocido al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseError = () => {
    setSaveError(null);
  };

  const handleCloseSuccess = () => {
    setSaveSuccess(false);
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
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" gutterBottom align="center">
            🎯 Game Over
          </Typography>

          <Typography
            variant="h5"
            sx={{ mt: 2, mb: 3 }}
            align="center"
            color="primary"
          >
            Puntuación: {score}
          </Typography>

          <Typography
            variant="body1"
            sx={{ mb: 3 }}
            align="center"
            color="text.secondary"
          >
            ¡Buen trabajo, {playerName}!
          </Typography>

          <Box sx={{ mt: 4, width: "100%" }}>
            <Button
              variant="contained"
              onClick={handleSaveScore}
              disabled={isSaving}
              fullWidth
              sx={{ mb: 2 }}
              size="large"
            >
              {isSaving ? "🔄 Guardando..." : "💾 Guardar Puntuación"}
            </Button>

            <Button
              variant="outlined"
              onClick={onRestart}
              fullWidth
              sx={{ mb: 2 }}
              size="large"
            >
              🎮 Jugar de Nuevo
            </Button>

            <Button variant="outlined" onClick={onMenu} fullWidth size="large">
              🏠 Menú Principal
            </Button>
          </Box>

          {/* Información sobre Firestore */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" align="center">
              💡 Si hay errores al guardar, verifica que Firestore esté
              configurado correctamente.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar para errores */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          ❌ Error al guardar: {saveError}
        </Alert>
      </Snackbar>

      {/* Snackbar para éxito */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          ✅ ¡Puntuación guardada correctamente!
        </Alert>
      </Snackbar>
    </Container>
  );
};
