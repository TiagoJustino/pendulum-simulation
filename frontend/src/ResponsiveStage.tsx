import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle } from "react-konva";

const ResponsiveStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        console.log("New container dimensions:", containerRef.current.offsetWidth, containerRef.current.offsetHeight);
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
      style={{ width: "100%", flex: 1, overflow: "hidden", border: "1px solid grey" }}
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Circle
            x={dimensions.width / 2}
            y={dimensions.height / 2}
            radius={50}
            fill="black"
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default ResponsiveStage;
