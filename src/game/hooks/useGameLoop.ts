import { useCallback, useRef } from "react";

export const useGameLoop = (callback: () => void, isActive: boolean) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        callback();
      }
      previousTimeRef.current = time;
      if (isActive) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [callback, isActive]
  );

  const startLoop = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stopLoop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  return { startLoop, stopLoop };
};
