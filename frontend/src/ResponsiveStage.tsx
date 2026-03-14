import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import type { Point } from "@pendulum-simulation/common";

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pivotPosition, setPivotPosition] = useState<Point>({ x: 0, y: 0 });
  const [bobPosition, setBobPosition] = useState<Point>({ x: 0, y: 0 });

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

  useEffect(() => {
    setPivotPosition({
      x: dimensions.width / 2,
      y: 25,
    });
  }, [dimensions]);

  useEffect(() => {
    setBobPosition({
      x: pivotPosition.x + 100,
      y: pivotPosition.y + 300,
    });
  }, [pivotPosition]);

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
        <Layer>
          <Circle
            x={pivotPosition.x}
            y={pivotPosition.y}
            radius={5}
            fill="black"
          />
          <Line
            points={[
              pivotPosition.x,
              pivotPosition.y,
              bobPosition.x,
              bobPosition.y,
            ]}
            strokeWidth={2}
            stroke="black"
          />
          <Circle
            x={bobPosition.x}
            y={bobPosition.y}
            radius={25}
            fill="black"
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
