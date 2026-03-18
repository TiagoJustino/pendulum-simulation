import { Stage, Layer } from "react-konva";
import Pendulum from "./Pendulum.tsx";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

interface Props {
  width: number;
  height: number;
  pendulumConfigs: InitPendulumRequestDto[];
  pendulumIds: (string | undefined)[];
  configVersion: number;
  onReady: (index: number, id: string) => void;
}

const ResponsiveStage = ({
  width,
  height,
  pendulumConfigs,
  pendulumIds,
  configVersion,
  onReady,
}: Props) => {
  return (
    <Stage width={width} height={height}>
      <Layer>
        {pendulumConfigs.map((config, i) => (
          <Pendulum
            key={i}
            index={i}
            config={config}
            configVersion={configVersion}
            existingId={pendulumIds[i]}
            onReady={onReady}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default ResponsiveStage;
