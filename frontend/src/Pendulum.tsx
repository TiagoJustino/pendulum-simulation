import { Circle, Group, Line } from "react-konva";
import type { AbsolutePosition, Point } from "@pendulum-simulation/common";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import { useEffect, useState } from "react";
import { useDeletePendulum, useInitPendulum } from "./hooks/usePendulum.ts";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

interface Props {
  index: number;
  config: InitPendulumRequestDto;
  configVersion: number;
  enabled: boolean;
  onReady: (index: number, id: string) => void;
}

const Pendulum = ({
  index,
  config,
  configVersion,
  enabled,
  onReady,
}: Props) => {
  const [bobPosition, setBobPosition] = useState<Point | null>(null);

  const { angle, length, mass, pivotPosition } = config;

  const initialBobPosition: Point = {
    x: pivotPosition.x + length * Math.sin((angle * Math.PI) / 180),
    y: pivotPosition.y + length * Math.cos((angle * Math.PI) / 180),
  };
  const displayBobPosition = bobPosition ?? initialBobPosition;

  const { data: pendulum } = useInitPendulum(config, enabled);
  const { mutate: deletePendulum } = useDeletePendulum(pendulum?.id || "");

  // Report ID to App when init resolves
  useEffect(() => {
    if (pendulum?.id) {
      onReady(index, pendulum.id);
    }
  }, [pendulum?.id, index, onReady]);

  // Reset visual position to new initial when config is saved
  useEffect(() => {
    setBobPosition(null);
  }, [configVersion]);

  useMqttSubscribe(
    `pendulum/${pendulum?.id}/position`,
    (position: AbsolutePosition, _topic) => {
      setBobPosition({ x: position.bobPosition.x, y: position.bobPosition.y });
    },
  );

  useEffect(() => {
    return () => {
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
      <Circle
        x={displayBobPosition.x}
        y={displayBobPosition.y}
        radius={mass}
        fill="black"
      />
    </Group>
  );
};

export default Pendulum;
