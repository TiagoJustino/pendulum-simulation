import { useState, useEffect, useCallback } from "react";
import ResponsiveStage from "./ResponsiveStage.tsx";
import { MqttProvider } from "@artcom/mqtt-topping-react";
import Toolbox from "./Toolbox.tsx";
import SettingsPanel from "./SettingsPanel.tsx";
import {
  usePause,
  useStop,
  usePlay,
  useCollisionCountdown,
  useListPendulums,
} from "./hooks/usePendulum.ts";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

const MIN_INSTANCES = 1;
const MAX_INSTANCES = 10;

type SimulationState = "running" | "paused" | "stopped" | "restarting";

function randomInt(min: number, max: number) {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  );
}

function randomConfig(stageWidth: number): InitPendulumRequestDto {
  return {
    angle: randomInt(0, 89),
    length: randomInt(100, 500),
    mass: randomInt(15, 40),
    pivotPosition: { x: randomInt(25, stageWidth - 25), y: 25 },
  };
}

function AppInner() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [pendulumConfigs, setPendulumConfigs] = useState<
    InitPendulumRequestDto[]
  >([]);
  const [pendulumIds, setPendulumIds] = useState<(string | undefined)[]>([]);
  const [gravity, setGravity] = useState(9.8);
  const [wind, setWind] = useState(0);
  const [configVersion, setConfigVersion] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [simulationState, setSimulationState] =
    useState<SimulationState>("running");
  const { mutate: pause } = usePause();
  const { mutate: stop } = useStop();
  const { mutate: play } = usePlay();
  const { countdown, clearCountdown } = useCollisionCountdown();
  const { data: existingData } = useListPendulums();

  useEffect(() => {
    if (!existingData || initialized) return;
    setInitialized(true);
    if (existingData.pendulums.length > 0) {
      setPendulumConfigs(existingData.pendulums.map((p) => p.config));
      setPendulumIds(existingData.pendulums.map((p) => p.id));
    } else {
      const defaultConfigs = Array.from({ length: 5 }, () =>
        randomConfig(window.innerWidth),
      );
      setPendulumConfigs(defaultConfigs);
      setPendulumIds(Array.from({ length: 5 }, () => undefined));
    }
    setSimulationState(existingData.state);
  }, [existingData]);

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setState = (next: SimulationState) => {
    console.log(`[state] ${simulationState} -> ${next}`);
    setSimulationState(next);
  };

  useEffect(() => {
    if (countdown !== null) {
      setState("restarting");
    } else if (simulationState === "restarting") {
      setState("running");
    }
  }, [countdown]);

  const handleReady = useCallback((index: number, id: string) => {
    setPendulumIds((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  }, []);

  const handleDecrease = () => {
    console.log("[button] remove instance");
    setPendulumConfigs((c) => {
      const next = Math.max(MIN_INSTANCES, c.length - 1);
      setPendulumIds((ids) => ids.slice(0, next));
      return c.slice(0, next);
    });
  };

  const handleIncrease = () => {
    console.log("[button] add instance");
    setPendulumConfigs((c) => {
      if (c.length >= MAX_INSTANCES) return c;
      setPendulumIds((ids) => [...ids, undefined]);
      return [...c, randomConfig(dimensions.width)];
    });
  };

  const handleSave = (
    configs: InitPendulumRequestDto[],
    newGravity: number,
    newWind: number,
  ) => {
    setPendulumConfigs(configs);
    setGravity(newGravity);
    setWind(newWind);
    setConfigVersion((v) => v + 1);
    setSettingsOpen(false);
  };

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
            instanceCount={pendulumConfigs.length}
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
            onSettings={() => setSettingsOpen(true)}
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
      {initialized && (
        <ResponsiveStage
          width={dimensions.width}
          height={dimensions.height}
          pendulumConfigs={pendulumConfigs}
          pendulumIds={pendulumIds}
          configVersion={configVersion}
          onReady={handleReady}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          pendulumConfigs={pendulumConfigs}
          pendulumIds={pendulumIds}
          gravity={gravity}
          wind={wind}
          stageWidth={dimensions.width}
          onSave={handleSave}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <MqttProvider uri={import.meta.env.VITE_MQTT_WS_URL ?? "ws://127.0.0.1:3002/mqtt"}>
      <AppInner />
    </MqttProvider>
  );
}

export default App;
