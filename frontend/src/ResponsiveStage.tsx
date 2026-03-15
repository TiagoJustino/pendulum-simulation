import { Stage } from "react-konva";
import { useInitPendulum } from "./hooks/usePendulum.ts";
import { useState, useEffect, useRef } from "react";
import Pendulum from "./Pendulum.tsx";
import type { Point } from "@pendulum-simulation/common";

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pivotPosition, setPivotPosition] = useState<Point>({ x: 0, y: 0 });

  const { data: pendulum } = useInitPendulum({ angle: 30, length: 450 });

  useEffect(() => {
    console.log(JSON.stringify({ pendulum }, null, 2));
  }, [pendulum]);

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
