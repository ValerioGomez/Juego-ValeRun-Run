import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
  Grid, // ✅ Usar Grid normal
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  PlayArrow,
  Leaderboard,
  Settings,
  ExitToApp,
  VolumeUp,
  VolumeOff,
  Close,
} from "@mui/icons-material";
import { useSoundManager, useSoundControls } from "../sound/SoundManager";

interface MenuScreenProps {
  playerName: string;
  onSelectDevice: () => void;
  onViewLeaderboard: () => void;
  onLogout: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  playerName,
  onSelectDevice,
  onViewLeaderboard,
  onLogout,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    totalWords: 0,
  });

  const soundManager = useSoundManager();
  const { setMusicVolume, setSFXVolume, toggleSound, getSoundState } =
    useSoundControls();
  const { volume: musicVolume, enabled: soundEnabled } = getSoundState();

  // Cargar estadísticas del localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("ztype-stats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handlePlay = () => {
    soundManager.play("laser");
    setTimeout(() => {
      onSelectDevice();
    }, 300);
  };

  const handleLeaderboard = () => {
    soundManager.play("laser");
    setTimeout(() => {
      onViewLeaderboard();
    }, 300);
  };

  const handleSettings = () => {
    soundManager.play("laser");
    setSettingsOpen(true);
  };

  const handleLogout = () => {
    soundManager.play("explosion");
    setTimeout(() => {
      onLogout();
    }, 500);
  };

  const handleMusicVolumeChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setMusicVolume((newValue as number) / 100);
  };

  const handleSFXVolumeChange = (event: Event, newValue: number | number[]) => {
    setSFXVolume((newValue as number) / 100);
  };

  const handleSoundToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleSound(event.target.checked);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #00ff00, #00ccff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
          }}
        >
          ZTYPE WARS
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ¡Destruye palabras antes de que te alcancen!
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Panel Principal */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            }}
          >
            {/* Información del Jugador */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h4" gutterBottom color="primary">
                ¡Bienvenido, {playerName}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ¿Estás listo para la batalla de palabras?
              </Typography>
            </Box>

            {/* Botones Principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handlePlay}
                  startIcon={<PlayArrow />}
                  sx={{
                    py: 2,
                    fontSize: "1.2rem",
                    background: "linear-gradient(45deg, #00c853, #00e676)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #00e676, #69f0ae)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  JUGAR
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleLeaderboard}
                  startIcon={<Leaderboard />}
                  sx={{
                    py: 2,
                    fontSize: "1.2rem",
                    borderColor: "#2196f3",
                    color: "#2196f3",
                    "&:hover": {
                      borderColor: "#64b5f6",
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  LEADERBOARD
                </Button>
              </Grid>
            </Grid>

            {/* Botones Secundarios */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="text"
                  fullWidth
                  onClick={handleSettings}
                  startIcon={<Settings />}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  Configuración
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="text"
                  fullWidth
                  onClick={handleLogout}
                  startIcon={<ExitToApp />}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                    },
                  }}
                >
                  Cerrar Sesión
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Panel de Estadísticas */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={8}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              align="center"
            >
              TUS ESTADÍSTICAS
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Partidas Jugadas
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {stats.gamesPlayed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Mejor Puntuación
                    </Typography>
                    <Typography variant="h4" color="secondary">
                      {stats.bestScore}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Palabras Destruidas
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.totalWords}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Controles Rápidos de Sonido */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                SONIDO
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={soundEnabled}
                    onChange={handleSoundToggle}
                    color="primary"
                  />
                }
                label={
                  soundEnabled ? (
                    <VolumeUp color="primary" />
                  ) : (
                    <VolumeOff color="disabled" />
                  )
                }
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de Configuración */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5">Configuración</Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>
              Volumen de Música: {Math.round(musicVolume * 100)}%
            </Typography>
            <Slider
              value={musicVolume * 100}
              onChange={handleMusicVolumeChange}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>
              Volumen de Efectos: {Math.round(musicVolume * 100)}%
            </Typography>
            <Slider
              value={musicVolume * 100}
              onChange={handleSFXVolumeChange}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                  color="primary"
                />
              }
              label="Sonido Activado"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} variant="contained">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 ZType Wars - Desarrollado con React + TypeScript + PixiJS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Usa el teclado para destruir palabras. ¡Cuidado con las que se
          acercan!
        </Typography>
      </Box>
    </Container>
  );
};
