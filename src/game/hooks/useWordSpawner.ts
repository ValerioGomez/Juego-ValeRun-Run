import { useCallback, useEffect, useRef } from "react";
import { generateRandomWord } from "../../logic/wordGenerator";

const SPAWN_INTERVAL = 2000; // ms

export const useWordSpawner = (
  state: any,
  dispatch: React.Dispatch<any>,
  customTextWords: string[]
) => {
  const spawnIntervalRef = useRef<NodeJS.Timeout>();

  const spawnWord = useCallback(() => {
    if (state.status !== "playing") return;

    const wordText =
      state.gameMode === "custom" && customTextWords.length > 0
        ? customTextWords[Math.floor(Math.random() * customTextWords.length)]
        : generateRandomWord();

    const newWord = {
      id: Date.now() + Math.random(),
      text: wordText,
      x: Math.random() * (state.canvasWidth - 100) + 50,
      y: -50,
      speed: 1 + Math.random() * 2,
      typedLetters: "",
    };

    dispatch({ type: "ADD_WORD", payload: newWord });
  }, [
    state.status,
    state.gameMode,
    state.canvasWidth,
    customTextWords,
    dispatch,
  ]);

  useEffect(() => {
    if (state.status === "playing") {
      spawnIntervalRef.current = setInterval(spawnWord, SPAWN_INTERVAL);
      // Spawn first word immediately
      setTimeout(spawnWord, 500);
    } else {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [state.status, spawnWord]);
};
