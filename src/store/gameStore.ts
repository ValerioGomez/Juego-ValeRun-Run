import { create } from "zustand";
import { saveHighScore, getTopHighScores } from "../firebase/firestoreService";
import { generateWordsFromText } from "../logic/wordGenerator";

// Solo definir tipos internamente (sin export)
type ScreenType =
  | "login"
  | "menu"
  | "deviceSelection"
  | "modeSelection"
  | "game"
  | "gameOver"
  | "leaderboard";
type DeviceType = "pc" | "mobile";
type GameMode = "generic" | "custom";

interface HighScore {
  name: string;
  score: number;
  createdAt: any;
}

interface GameState {
  currentScreen: ScreenType;
  playerName: string | null;
  deviceType: DeviceType;
  gameMode: GameMode;
  customTextWords: string[];
  finalScore: number;
  highScores: HighScore[];
  isLoadingScores: boolean;
}

interface GameActions {
  setScreen: (screen: ScreenType) => void;
  setPlayerName: (name: string) => void;
  setDeviceType: (device: DeviceType) => void;
  setGameMode: (mode: GameMode, text?: string) => void;
  setFinalScore: (score: number) => void;
  resetGame: () => void;
  fetchHighScores: () => void;
  saveCurrentScore: () => Promise<void>;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  currentScreen: "login",
  playerName: null,
  deviceType: "pc",
  gameMode: "generic",
  customTextWords: [],
  finalScore: 0,
  highScores: [],
  isLoadingScores: true,

  setScreen: (screen) => set({ currentScreen: screen }),
  setPlayerName: (name) => set({ playerName: name }),

  setDeviceType: (device) => set({ deviceType: device }),
  setGameMode: (mode, text) => {
    const words = mode === "custom" && text ? generateWordsFromText(text) : [];
    set({ gameMode: mode, customTextWords: words });
  },

  setFinalScore: (score) => set({ finalScore: score }),
  resetGame: () => set({ finalScore: 0, customTextWords: [] }),

  fetchHighScores: async () => {
    set({ isLoadingScores: true });
    try {
      const scores = await getTopHighScores();
      set({ highScores: scores });
    } catch (error) {
      console.error("Failed to fetch high scores:", error);
    } finally {
      set({ isLoadingScores: false });
    }
  },

  saveCurrentScore: async () => {
    const { playerName, finalScore } = get();
    if (playerName) {
      await saveHighScore(playerName, finalScore);
      get().fetchHighScores();
    }
  },
}));
