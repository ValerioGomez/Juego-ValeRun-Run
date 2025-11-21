import React, { useEffect } from "react";
import { Graphics } from "@pixi/react";
import gsap from "gsap";

interface ExplosionProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export const Explosion: React.FC<ExplosionProps> = ({ x, y, onComplete }) => {
  const particleCount = 8;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / particleCount,
    distance: 0,
    alpha: 1,
  }));

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    particles.forEach((particle) => {
      tl.to(
        particle,
        {
          distance: Math.random() * 30 + 20,
          alpha: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0
      );
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0xffff00, 0.8);
        particles.forEach((particle) => {
          if (particle.alpha > 0) {
            const px = Math.cos(particle.angle) * particle.distance;
            const py = Math.sin(particle.angle) * particle.distance;
            g.drawCircle(px, py, 3);
          }
        });
        g.endFill();
      }}
      x={x}
      y={y}
    />
  );
};
