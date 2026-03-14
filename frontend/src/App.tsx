import { Stage, Layer, Circle } from "react-konva";

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Pendulum Simulation</h1>
          <p>
            This is a Simple Pendulum simulation using React and Typescript.
          </p>
        </div>
      </section>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Circle radius={50} fill="black" />
        </Layer>
      </Stage>
    </>
  );
}

export default App
