import { Stage } from "react-konva";
import { useInitPendulum } from "./hooks/usePendulum.ts";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import { useState, useEffect, useRef } from "react";
import Pendulum from "./Pendulum.tsx";
import type { Point } from "@pendulum-simulation/common";

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pivotPosition, setPivotPosition] = useState<Point>({ x: 0, y: 0 });
  const [bobPosition, setBobPosition] = useState<Point>({ x: 0, y: 0 });

  useInitPendulum({angle: 30, length: 450});

  useMqttSubscribe("my/topic", (position: Point, _topic) => {
    setBobPosition({
      x: pivotPosition.x + position.x,
      y: pivotPosition.y + position.y,
    });
  });

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
        <Pendulum {...{ pivotPosition, bobPosition }} />
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
