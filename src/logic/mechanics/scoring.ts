export const calculateScore = (
  wordLength: number,
  speed: number,
  combo: number
): number => {
  const baseScore = wordLength * 10;
  const speedMultiplier = 1 + speed / 100;
  const comboMultiplier = 1 + combo * 0.1;
  return Math.floor(baseScore * speedMultiplier * comboMultiplier);
};
