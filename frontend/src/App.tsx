import ResponsiveStage from "./ResponsiveStage.tsx";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 16px)" }}>
      <section id="center">
        <div>
          <h1>Pendulum Simulation</h1>
          <p>
            This is a Simple Pendulum simulation using React and Typescript.
          </p>
        </div>
      </section>
      <ResponsiveStage />
    </div>
  );
}

export default App
