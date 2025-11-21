import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
} from "@mui/material";

// Definir tipos localmente
type GameMode = "generic" | "custom";

interface ModeSelectionProps {
  onModeSelect: (mode: GameMode, text?: string) => void;
  onBack: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({
  onModeSelect,
  onBack,
}) => {
  const [customText, setCustomText] = useState("");

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
            Seleccionar Modo
          </Typography>
          <Box sx={{ mt: 4, width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => onModeSelect("generic")}
              fullWidth
              sx={{ mb: 2 }}
              size="large"
            >
              Modo Genérico
            </Button>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }} align="center">
              O ingresa texto personalizado:
            </Typography>

            <TextField
              label="Texto personalizado"
              multiline
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              onClick={() => onModeSelect("custom", customText)}
              fullWidth
              sx={{ mb: 2 }}
              disabled={!customText.trim()}
            >
              Jugar con Texto Personalizado
            </Button>

            <Button variant="text" onClick={onBack} fullWidth>
              Volver
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
