import {
  MinusCircle,
  PlusCircle,
  Settings,
  PauseCircle,
  StopCircle,
  PlayCircle,
} from "react-feather";

interface Props {
  onDecrease: () => void;
  onIncrease: () => void;
  onPause: () => void;
  onStop: () => void;
  onPlay: () => void;
}

const Toolbox = ({ onDecrease, onIncrease, onPause, onStop, onPlay }: Props) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <MinusCircle size={48} onClick={onDecrease} style={{ cursor: "pointer" }} />
    <PlusCircle size={48} onClick={onIncrease} style={{ cursor: "pointer" }} />
    <span style={{ borderLeft: "1px solid grey", height: "48px" }} />
    <Settings size={48} />
    <span style={{ borderLeft: "1px solid grey", height: "48px" }} />
    <PauseCircle size={48} onClick={onPause} style={{ cursor: "pointer" }} />
    <StopCircle size={48} onClick={onStop} style={{ cursor: "pointer" }} />
    <PlayCircle size={48} onClick={onPlay} style={{ cursor: "pointer" }} />
  </div>
);

export default Toolbox;
