import { Circle, Layer, Line } from "react-konva";
import type { AbsolutePosition, Point } from "@pendulum-simulation/common";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import { useState } from "react";
import { useInitPendulum } from "./hooks/usePendulum.ts";

interface Props {
  angle: number;
  length: number;
  pivotPosition: Point;
  enabled: boolean;
}

const Pendulum = ({ pivotPosition, angle, length, enabled }: Props) => {
  const [bobPosition, setBobPosition] = useState<Point>({ x: 0, y: 0 });
  const { data: pendulum } = useInitPendulum(
    { angle, length, pivotPosition },
    pivotPosition && enabled,
  );

  useMqttSubscribe(
    `pendulum/${pendulum?.id}/position`,
    (position: AbsolutePosition, _topic) => {
      setBobPosition({
        x: position.bobPosition.x,
        y: position.bobPosition.y,
      });
    },
  );

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
