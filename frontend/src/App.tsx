import { useState, useEffect } from "react";
import ResponsiveStage from "./ResponsiveStage.tsx";
import { MqttProvider } from "@artcom/mqtt-topping-react";
import Toolbox from "./Toolbox.tsx";
import { usePause, useStop, usePlay, useCollisionCountdown } from "./hooks/usePendulum.ts";

const MIN_INSTANCES = 1;
const MAX_INSTANCES = 10;

type SimulationState = "running" | "paused" | "stopped" | "restarting";

function AppInner() {
  const [numPendulums, setNumPendulums] = useState(5);
  const [simulationState, setSimulationState] = useState<SimulationState>("running");
  const { mutate: pause } = usePause();
  const { mutate: stop } = useStop();
  const { mutate: play } = usePlay();
  const { countdown, clearCountdown } = useCollisionCountdown();

  const setState = (next: SimulationState) => {
    console.log(`[state] ${simulationState} -> ${next}`);
    setSimulationState(next);
  };

  useEffect(() => { play(); }, []);

  useEffect(() => {
    if (countdown !== null) {
      setState("restarting");
    } else if (simulationState === "restarting") {
      setState("running");
    }
  }, [countdown]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 16px)",
      }}
    >
      <section id="center">
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div>
            <h1>Pendulum Simulation</h1>
            <p>
              This is a Simple Pendulum simulation using React and Typescript.
            </p>
          </div>
          <Toolbox
            simulationState={simulationState}
            onDecrease={() => {
              console.log("[button] remove instance");
              setNumPendulums((n) => Math.max(MIN_INSTANCES, n - 1));
            }}
            onIncrease={() => {
              console.log("[button] add instance");
              setNumPendulums((n) => Math.min(MAX_INSTANCES, n + 1));
            }}
            onPause={() => {
              console.log("[button] pause");
              pause();
              setState("paused");
            }}
            onStop={() => {
              console.log("[button] stop");
              stop();
              clearCountdown();
              setState("stopped");
            }}
            onPlay={() => {
              console.log("[button] play");
              play();
              setState("running");
            }}
            countdown={countdown}
          />
        </div>
      </section>
      <ResponsiveStage numPendulums={numPendulums} />
    </div>
  );
}

function App() {
  return (
    <MqttProvider uri="ws://127.0.0.1:3002/mqtt">
      <AppInner />
    </MqttProvider>
  );
}

export default App;
