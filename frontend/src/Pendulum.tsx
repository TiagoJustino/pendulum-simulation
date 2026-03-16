import { Circle, Group, Line } from "react-konva";
import type { AbsolutePosition, Point } from "@pendulum-simulation/common";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import { useEffect, useState } from "react";
import {
  useDeletePendulum,
  useInitPendulum,
  useUpdatePendulum,
} from "./hooks/usePendulum.ts";

function randomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}

interface Props {
  stageWidth: number;
  enabled: boolean;
}

const Pendulum = ({ stageWidth, enabled }: Props) => {
  const [bobPosition, setBobPosition] = useState<Point | null>(null);
  const [angle] = useState(() => randomInt(0, 89));
  const [length] = useState(() => randomInt(100, 500));
  const [mass] = useState(() => randomInt(15, 40));
  const [pivotPosition, setPivotPosition] = useState<Point>(() => {
    return { x: randomInt(25, stageWidth - 25), y: 25 };
  });

  const initialBobPosition: Point = {
    x: pivotPosition.x + length * Math.sin((angle * Math.PI) / 180),
    y: pivotPosition.y + length * Math.cos((angle * Math.PI) / 180),
  };
  const displayBobPosition = bobPosition ?? initialBobPosition;
  const { data: pendulum } = useInitPendulum(
    { angle, length, mass, pivotPosition },
    pivotPosition && enabled,
  );
  const { mutate: deletePendulum } = useDeletePendulum(pendulum?.id || "");
  const { mutate: updatePendulum } = useUpdatePendulum(pendulum?.id || "");

  useEffect(() => {
    if (pivotPosition.x > stageWidth - 25 || pivotPosition.x < 25) {
      setPivotPosition({ x: randomInt(25, stageWidth - 25), y: 25 });
    }
  }, [stageWidth]);

  useEffect(() => {
    if (pendulum?.id && pivotPosition.x >= 25) {
      updatePendulum({ angle, length, mass, pivotPosition });
    }
  }, [pivotPosition]);

  useMqttSubscribe(
    `pendulum/${pendulum?.id}/position`,
    (position: AbsolutePosition, _topic) => {
      setBobPosition({ x: position.bobPosition.x, y: position.bobPosition.y });
    },
  );

  useEffect(() => {
    return () => {
      // Unsubscribe to `pendulum/${pendulum?.id}/position`
      deletePendulum();
    };
  }, []);

  return (
    <Group>
      <Circle x={pivotPosition.x} y={pivotPosition.y} radius={5} fill="black" />
      <Line
        points={[
          pivotPosition.x,
          pivotPosition.y,
          displayBobPosition.x,
          displayBobPosition.y,
        ]}
        strokeWidth={2}
        stroke="black"
      />
      <Circle x={displayBobPosition.x} y={displayBobPosition.y} radius={mass} fill="black" />
    </Group>
  );
};

export default Pendulum;
