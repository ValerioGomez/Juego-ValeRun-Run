import React, { useEffect } from "react";
import { Graphics } from "@pixi/react";
import gsap from "gsap";

interface LaserProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: () => void;
}

export const Laser: React.FC<LaserProps> = ({
  startX,
  startY,
  endX,
  endY,
  onComplete,
}) => {
  const ref = React.useRef<any>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { alpha: 1, scaleY: 0 },
        {
          alpha: 0,
          scaleY: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete,
        }
      );
    }
  }, [onComplete]);

  return (
    <Graphics
      ref={ref}
      draw={(g) => {
        g.clear();
        g.lineStyle(2, 0x00ffff, 1);
        g.moveTo(0, 0);
        g.lineTo(0, Math.hypot(endX - startX, endY - startY));
      }}
      x={startX}
      y={startY}
      rotation={Math.atan2(endY - startY, endX - startX) - Math.PI / 2}
    />
  );
};
