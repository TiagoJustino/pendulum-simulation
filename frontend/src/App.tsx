import { useState } from "react";
import ResponsiveStage from "./ResponsiveStage.tsx";
import { MqttProvider } from "@artcom/mqtt-topping-react";
import Toolbox from "./Toolbox.tsx";
import { usePause, useStop, usePlay } from "./hooks/usePendulum.ts";

const MIN_INSTANCES = 1;
const MAX_INSTANCES = 10;

function App() {
  const [numPendulums, setNumPendulums] = useState(5);
  const { mutate: pause } = usePause();
  const { mutate: stop } = useStop();
  const { mutate: play } = usePlay();

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
            onDecrease={() =>
              setNumPendulums((n) => Math.max(MIN_INSTANCES, n - 1))
            }
            onIncrease={() =>
              setNumPendulums((n) => Math.min(MAX_INSTANCES, n + 1))
            }
            onPause={() => pause()}
            onStop={() => stop()}
            onPlay={() => play()}
          />
        </div>
      </section>
      <MqttProvider uri="ws://127.0.0.1:3002/mqtt">
        <ResponsiveStage numPendulums={numPendulums} />
      </MqttProvider>
    </div>
  );
}

export default App;
