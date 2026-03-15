import { Circle, Layer, Line } from "react-konva";
import type { Point } from "@pendulum-simulation/common";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import { useState } from "react";

interface Props {
  id: string;
  pivotPosition: Point;
}

const Pendulum = ({ pivotPosition, id }: Props) => {
  const [bobPosition, setBobPosition] = useState<Point>({ x: 0, y: 0 });

  useMqttSubscribe(`pendulum/${id}/position`, (position: Point, _topic) => {
    setBobPosition({
      x: pivotPosition.x + position.x,
      y: pivotPosition.y + position.y,
    });
  });

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
