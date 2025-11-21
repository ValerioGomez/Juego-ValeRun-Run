const commonWords = [
  "javascript",
  "react",
  "typescript",
  "firebase",
  "componente",
  "estado",
];

export const generateRandomWord = (): string => {
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};

export const generateWordsFromText = (text: string): string[] => {
  const cleanedText = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  return cleanedText.split(/\s+/).filter((word) => word.length > 0);
};
