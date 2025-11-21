import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useGameStore } from "./store/gameStore";
import { LoginScreen } from "./screens/LoginScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { DeviceSelection } from "./screens/DeviceSelection";
import { ModeSelection } from "./screens/ModeSelection";
import { Game } from "./game/Game";
import { GameOver } from "./screens/GameOver";
import { Leaderboard } from "./screens/Leaderboard";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ff00",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
  },
});

const App: React.FC = () => {
  const {
    currentScreen,
    playerName,
    deviceType,
    gameMode,
    customTextWords,
    finalScore,
    setScreen,
    setPlayerName,
    setDeviceType,
    setGameMode,
    setFinalScore,
  } = useGameStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {currentScreen === "login" && (
        <LoginScreen
          onLogin={(name) => {
            setPlayerName(name);
            setScreen("menu");
          }}
        />
      )}

      {currentScreen === "menu" && playerName && (
        <MenuScreen
          playerName={playerName}
          onSelectDevice={() => setScreen("deviceSelection")}
          onViewLeaderboard={() => setScreen("leaderboard")}
        />
      )}

      {currentScreen === "deviceSelection" && (
        <DeviceSelection
          onDeviceSelect={(device) => {
            setDeviceType(device);
            setScreen("modeSelection");
          }}
          onBack={() => setScreen("menu")}
        />
      )}

      {currentScreen === "modeSelection" && (
        <ModeSelection
          onModeSelect={(mode, text) => {
            setGameMode(mode, text);
            setScreen("game");
          }}
          onBack={() => setScreen("deviceSelection")}
        />
      )}

      {currentScreen === "game" && playerName && (
        <Game
          playerName={playerName}
          deviceType={deviceType}
          gameMode={gameMode}
          customTextWords={customTextWords}
          onGameOver={(score) => {
            setFinalScore(score);
            setScreen("gameOver");
          }}
        />
      )}

      {currentScreen === "gameOver" && playerName && (
        <GameOver
          score={finalScore}
          playerName={playerName}
          onRestart={() => setScreen("deviceSelection")}
          onMenu={() => setScreen("menu")}
          onViewLeaderboard={() => setScreen("leaderboard")}
        />
      )}

      {currentScreen === "leaderboard" && (
        <Leaderboard onBack={() => setScreen("menu")} />
      )}
    </ThemeProvider>
  );
};

export default App;
