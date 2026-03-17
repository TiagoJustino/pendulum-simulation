import {
  MinusCircle,
  PlusCircle,
  Settings,
  PauseCircle,
  StopCircle,
  PlayCircle,
} from "react-feather";

type SimulationState = "running" | "paused" | "stopped" | "restarting";

interface Props {
  simulationState: SimulationState;
  onDecrease: () => void;
  onIncrease: () => void;
  onSettings: () => void;
  onPause: () => void;
  onStop: () => void;
  onPlay: () => void;
  countdown?: number | null;
}

const disabledStyle = { opacity: 0.3, cursor: "not-allowed" } as const;
const activeStyle = { cursor: "pointer" } as const;

const Toolbox = ({ simulationState, onDecrease, onIncrease, onSettings, onPause, onStop, onPlay, countdown }: Props) => {
  const instancesDisabled = simulationState !== "stopped";
  const settingsDisabled = simulationState !== "stopped";
  const pauseDisabled = simulationState === "paused" || simulationState === "stopped" || simulationState === "restarting";
  const stopDisabled = simulationState === "stopped";
  const playDisabled = simulationState === "running" || simulationState === "restarting";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <MinusCircle
        size={48}
        onClick={instancesDisabled ? undefined : onDecrease}
        style={instancesDisabled ? disabledStyle : activeStyle}
      />
      <PlusCircle
        size={48}
        onClick={instancesDisabled ? undefined : onIncrease}
        style={instancesDisabled ? disabledStyle : activeStyle}
      />
      <span style={{ borderLeft: "1px solid grey", height: "48px" }} />
      <Settings
        size={48}
        onClick={settingsDisabled ? undefined : () => { console.log("[button] settings"); onSettings(); }}
        style={settingsDisabled ? disabledStyle : activeStyle}
      />
      <span style={{ borderLeft: "1px solid grey", height: "48px" }} />
      <PauseCircle
        size={48}
        onClick={pauseDisabled ? undefined : onPause}
        style={pauseDisabled ? disabledStyle : activeStyle}
      />
      <StopCircle
        size={48}
        onClick={stopDisabled ? undefined : onStop}
        style={stopDisabled ? disabledStyle : activeStyle}
      />
      <PlayCircle
        size={48}
        onClick={playDisabled ? undefined : onPlay}
        style={playDisabled ? disabledStyle : activeStyle}
      />
      {countdown != null && (
        <span style={{ fontSize: "24px", fontWeight: "bold", minWidth: "24px" }}>
          {countdown}
        </span>
      )}
    </div>
  );
};

export default Toolbox;
