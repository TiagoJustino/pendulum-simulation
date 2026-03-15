import { Stage } from "react-konva";
import { useClear } from "./hooks/usePendulum.ts";
import { useState, useEffect, useRef } from "react";
import Pendulum from "./Pendulum.tsx";
import type { Point } from "@pendulum-simulation/common";

function randomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}

const NUM_PENDULUMS = 5;

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pivotPositionValues = Array.from({ length: NUM_PENDULUMS }, () => ({
    x: randomInt(25, dimensions.width - 25),
    y: 25,
  }));
  const [pivotPositions, setPivotPositions] = useState<Point[]>(
    () => pivotPositionValues,
  );
  const pendulumParamsValues = Array.from({ length: NUM_PENDULUMS }, () => ({
    angle: randomInt(0, 89),
    length: randomInt(100, 500),
  }));
  const [pendulumParams] = useState(() => pendulumParamsValues);

  const { data: clearResponse } = useClear();

  useEffect(() => {
    const newPositions = [];
    let changed = false;
    for (const pivotPosition of pivotPositions) {
      if (pivotPosition.x > dimensions.width - 25 || pivotPosition.x < 25) {
        newPositions.push({
          x: randomInt(25, dimensions.width - 25),
          y: 25,
        });
        changed = true;
      } else {
        newPositions.push(pivotPosition);
      }
    }
    if (changed) {
      setPivotPositions(newPositions);
    }
  }, [pivotPositions, dimensions]);

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
        {pendulumParams.map((params, i) => (
          <Pendulum
            key={i}
            pivotPosition={pivotPositions[i]!}
            angle={params.angle}
            length={params.length}
            enabled={clearResponse?.success ?? false}
          />
        ))}
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
