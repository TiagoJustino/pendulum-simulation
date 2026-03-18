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
  existingId?: string;
  onReady: (index: number, id: string) => void;
}

const Pendulum = ({
  index,
  config,
  configVersion,
  existingId,
  onReady,
}: Props) => {
  const [bobPosition, setBobPosition] = useState<Point | null>(null);

  const { angle, length, mass, pivotPosition } = config;

  const initialBobPosition: Point = {
    x: pivotPosition.x + length * Math.sin((angle * Math.PI) / 180),
    y: pivotPosition.y + length * Math.cos((angle * Math.PI) / 180),
  };
  const displayBobPosition = bobPosition ?? initialBobPosition;

  // Only create a new pendulum if we don't have an existing one to adopt
  const { data: created } = useInitPendulum(config, existingId === undefined);
  const pendulumId = existingId ?? created?.id;
  const { mutate: deletePendulum } = useDeletePendulum(pendulumId || "");

  // Report ID to App when init resolves (only for freshly created pendulums)
  useEffect(() => {
    if (created?.id) {
      onReady(index, created.id);
    }
  }, [created?.id, index, onReady]);

  // Reset visual position to new initial when config is saved
  useEffect(() => {
    setBobPosition(null);
  }, [configVersion]);

  useMqttSubscribe(
    `pendulum/${pendulumId}/position`,
    (position: AbsolutePosition, _topic) => {
      setBobPosition({ x: position.bobPosition.x, y: position.bobPosition.y });
    },
  );

  // Only delete on unmount for pendulums we created (not adopted ones)
  useEffect(() => {
    if (existingId !== undefined) return;
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
