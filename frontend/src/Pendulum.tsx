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
  const [bobPosition, setBobPosition] = useState<Point>({ x: 0, y: 0 });
  const [angle] = useState(() => randomInt(0, 89));
  const [length] = useState(() => randomInt(100, 500));
  const [mass] = useState(() => randomInt(15, 40));
  const [shouldRender, setShouldRender] = useState(false);
  const [pivotPosition, setPivotPosition] = useState<Point>(() => {
    return { x: randomInt(25, stageWidth - 25), y: 25 };
  });
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
      setBobPosition({
        x: position.bobPosition.x,
        y: position.bobPosition.y,
      });
    },
  );

  useEffect(() => {
    return () => {
      // Unsubscribe to `pendulum/${pendulum?.id}/position`
      deletePendulum();
    };
  }, []);

  useEffect(() => {
    if (!pivotPosition) {
      return setShouldRender(false);
    }
    if (!bobPosition) {
      return setShouldRender(false);
    }
    if (bobPosition.x == 0 && bobPosition.y == 0) {
      return setShouldRender(false);
    }
    setShouldRender(true);
  }, [pivotPosition, bobPosition]);

  return (
    <Group>
      {shouldRender && (
        <>
          <Circle
            x={pivotPosition.x}
            y={pivotPosition.y}
            radius={5}
            fill="black"
          />
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
          <Circle
            x={bobPosition.x}
            y={bobPosition.y}
            radius={mass}
            fill="black"
          />
        </>
      )}
    </Group>
  );
};

export default Pendulum;
