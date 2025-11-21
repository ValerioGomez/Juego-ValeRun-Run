import React, { memo } from "react";
import { Text } from "@pixi/react";
import * as PIXI from "pixi.js";

interface WordProps {
  word: {
    id: number;
    text: string;
    x: number;
    y: number;
    typedLetters: string;
  };
  isActive: boolean;
}

const Word: React.FC<WordProps> = memo(({ word, isActive }) => {
  const { text, x, y, typedLetters } = word;

  const baseStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: isActive ? 24 : 18,
    fill: isActive ? 0xffffff : 0xaaaaaa,
    align: "center",
  });

  const typedStyle = new PIXI.TextStyle({
    ...baseStyle,
    fill: 0xffd700,
  });

  return (
    <Text text={text} x={x} y={y} style={baseStyle}>
      {text.split("").map((char, index) => (
        <Text
          key={index}
          text={char}
          style={index < typedLetters.length ? typedStyle : baseStyle}
          x={index * (isActive ? 14 : 12)}
        />
      ))}
    </Text>
  );
});

export default Word;
