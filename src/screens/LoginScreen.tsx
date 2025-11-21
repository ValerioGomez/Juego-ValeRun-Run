import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";

interface LoginScreenProps {
  onLogin: (playerName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [nickname, setNickname] = useState("");
  const [isChoosingNickname, setIsChoosingNickname] = useState(false);

  const handleGuestLogin = () => {
    onLogin(`Invitado-${Math.floor(Math.random() * 10000)}`);
  };

  const handleNicknameLogin = () => {
    if (nickname.trim()) {
      onLogin(nickname.trim());
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
            ZType Game
          </Typography>

          {!isChoosingNickname ? (
            <>
              <Button
                variant="contained"
                onClick={handleGuestLogin}
                fullWidth
                sx={{ mb: 2 }}
              >
                Jugar como Invitado
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsChoosingNickname(true)}
                fullWidth
              >
                Elegir Nickname
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Tu Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                autoFocus
              />
              <Button
                variant="contained"
                onClick={handleNicknameLogin}
                disabled={!nickname.trim()}
                fullWidth
                sx={{ mb: 2 }}
              >
                Comenzar a Jugar
              </Button>
              <Button
                variant="text"
                onClick={() => setIsChoosingNickname(false)}
                fullWidth
              >
                Volver
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
