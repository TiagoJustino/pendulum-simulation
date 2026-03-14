import { Circle, Layer, Line } from "react-konva";
import type { Point } from "@pendulum-simulation/common";

interface Props {
  pivotPosition: Point;
  bobPosition: Point;
}

const Pendulum = ({ pivotPosition, bobPosition }: Props) => {
  return (
    <Layer>
      <Circle x={pivotPosition.x} y={pivotPosition.y} radius={5} fill="black" />
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
      <Circle x={bobPosition.x} y={bobPosition.y} radius={25} fill="black" />
    </Layer>
  );
};

export default Pendulum;
