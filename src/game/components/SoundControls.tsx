import React from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useSoundControls } from "../sound/SoundManager";

export const SoundControls: React.FC = () => {
  const { setMusicVolume, setSFXVolume, toggleSound, getSoundState } =
    useSoundControls();
  const { volume: musicVolume, enabled: soundEnabled } = getSoundState();

  return (
    <Box sx={{ p: 2, backgroundColor: "background.paper", borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Controles de Sonido
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={soundEnabled}
            onChange={(e) => toggleSound(e.target.checked)}
            color="primary"
          />
        }
        label="Sonido Activado"
      />

      {soundEnabled && (
        <>
          <Typography gutterBottom>
            Volumen Música: {Math.round(musicVolume * 100)}%
          </Typography>
          <Slider
            value={musicVolume * 100}
            onChange={(_, value) => setMusicVolume((value as number) / 100)}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />

          <Typography gutterBottom>
            Volumen Efectos: {Math.round(musicVolume * 100)}%
          </Typography>
          <Slider
            value={musicVolume * 100}
            onChange={(_, value) => setSFXVolume((value as number) / 100)}
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
        </>
      )}
    </Box>
  );
};
