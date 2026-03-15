import { Stage } from "react-konva";
import { useInitPendulum, useClear } from "./hooks/usePendulum.ts";
import { useState, useEffect, useRef } from "react";
import Pendulum from "./Pendulum.tsx";
import type { Point } from "@pendulum-simulation/common";

function randomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pivotPosition, setPivotPosition] = useState<Point>(() => ({
    x: randomInt(25, dimensions.width - 25),
    y: 25,
  }));
  const [pendulumParams] = useState(() => ({
    angle: randomInt(0, 89),
    length: randomInt(100, 500),
  }));

  const { data: clearResponse } = useClear();
  const { data: pendulum } = useInitPendulum(
    { angle: pendulumParams.angle, length: pendulumParams.length },
    clearResponse?.success,
  );

  useEffect(() => {
    if (
      pivotPosition.x > dimensions.width - 25 ||
      pivotPosition.x < 25
    ) {
      setPivotPosition({
        x: randomInt(25, dimensions.width - 25),
        y: 25,
      });
    }
  }, [pivotPosition, dimensions]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions(); // Set initial dimensions

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        flex: 1,
        overflow: "hidden",
        border: "1px solid grey",
      }}
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        {pendulum?.id && <Pendulum {...{ pivotPosition, id: pendulum!.id }} />}
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
