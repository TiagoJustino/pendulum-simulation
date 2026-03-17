import { Stage, Layer } from "react-konva";
import Pendulum from "./Pendulum.tsx";
import { useClear } from "./hooks/usePendulum.ts";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

interface Props {
  width: number;
  height: number;
  pendulumConfigs: InitPendulumRequestDto[];
  configVersion: number;
  onReady: (index: number, id: string) => void;
}

const ResponsiveStage = ({ width, height, pendulumConfigs, configVersion, onReady }: Props) => {
  const { data: clearResponse } = useClear();
  const enabled = clearResponse?.success ?? false;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {pendulumConfigs.map((config, i) => (
          <Pendulum
            key={i}
            index={i}
            config={config}
            configVersion={configVersion}
            enabled={enabled}
            onReady={onReady}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default ResponsiveStage;
