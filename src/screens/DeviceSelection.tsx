import React from "react";
import { Button, Typography, Container, Box, Paper } from "@mui/material";

// Definir tipos localmente
type DeviceType = "pc" | "mobile";

interface DeviceSelectionProps {
  onDeviceSelect: (device: DeviceType) => void;
  onBack: () => void;
}

export const DeviceSelection: React.FC<DeviceSelectionProps> = ({
  onDeviceSelect,
  onBack,
}) => {
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
            Seleccionar Dispositivo
          </Typography>
          <Box sx={{ mt: 4, width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => onDeviceSelect("pc")}
              fullWidth
              sx={{ mb: 2 }}
              size="large"
            >
              Modo PC
            </Button>
            <Button
              variant="contained"
              onClick={() => onDeviceSelect("mobile")}
              fullWidth
              sx={{ mb: 2 }}
              size="large"
            >
              Modo Móvil
            </Button>
            <Button variant="outlined" onClick={onBack} fullWidth>
              Volver
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
