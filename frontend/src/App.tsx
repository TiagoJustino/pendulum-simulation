import ResponsiveStage from "./ResponsiveStage.tsx";
import { MqttProvider } from "@artcom/mqtt-topping-react";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 16px)",
      }}
    >
      <section id="center">
        <div>
          <h1>Pendulum Simulation</h1>
          <p>
            This is a Simple Pendulum simulation using React and Typescript.
          </p>
        </div>
      </section>
      <MqttProvider uri="ws://127.0.0.1:3000/mqtt">
        <ResponsiveStage />
      </MqttProvider>
    </div>
  );
}

export default App;
