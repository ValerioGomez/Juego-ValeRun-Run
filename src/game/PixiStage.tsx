import React from "react";
import { Stage } from "@pixi/react";

interface PixiStageProps {
  children: React.ReactNode;
  width: number;
  height: number;
}

export const PixiStage: React.FC<PixiStageProps> = ({
  children,
  width,
  height,
}) => {
  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x000033,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }}
    >
      {children}
    </Stage>
  );
};
