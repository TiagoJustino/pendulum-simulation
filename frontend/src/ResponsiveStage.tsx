import { Stage } from "react-konva";
import { useClear } from "./hooks/usePendulum.ts";
import { useState, useEffect, useRef } from "react";
import Pendulum from "./Pendulum.tsx";

interface Props {
  numPendulums: number;
}

const ResponsiveStage = ({ numPendulums }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { data: clearResponse } = useClear();

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
        {Array.from({ length: numPendulums }, (_, i) => (
          <Pendulum
            key={i}
            stageWidth={dimensions.width}
            enabled={clearResponse?.success ?? false}
          />
        ))}
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
