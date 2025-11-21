import React from "react";
import { Graphics } from "@pixi/react";

interface ShipProps {
  x: number;
  y: number;
}

export const Ship: React.FC<ShipProps> = ({ x, y }) => {
  return (
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x00ff00);
        g.moveTo(0, -15);
        g.lineTo(10, 15);
        g.lineTo(-10, 15);
        g.closePath();
        g.endFill();
      }}
      x={x}
      y={y}
    />
  );
};
