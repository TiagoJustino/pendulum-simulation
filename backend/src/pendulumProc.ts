import { pendulumFactory } from "./pendulumFactory.js";
import mqtt from "mqtt";
import { PendulumMqttClient } from "./mqttClient.js";
import { consoleErrorWithFlush } from "./consoleErrorWithFlush.js";

if (process.argv.length < 6) {
  console.error(
    "Usage: node pendulumProc.js <id> <angle> <length> <mass> <pivotX> <pivotY>",
  );
  process.exit(1);
}

const id: string = process.argv[2]!;
const angle = parseFloat(process.argv[3]!);
const length = parseFloat(process.argv[4]!);
const mass = parseFloat(process.argv[5]!);
const pivotX = parseFloat(process.argv[6]!);
const pivotY = parseFloat(process.argv[7]!);

const mqttClient = await mqtt.connectAsync("mqtt://127.0.0.1:1883");
const pendulumMqttClient = new PendulumMqttClient(id, mqttClient);
const pendulum = pendulumFactory(
  angle,
  length,
  mass,
  { x: pivotX, y: pivotY },
  pendulumMqttClient,
);

process.on("message", async (msg: any) => {
  switch (msg.command) {
    case "POSITION":
      console.log(JSON.stringify(pendulum.getRelativeBobPosition()));
      break;
    case "UPDATE":
      await consoleErrorWithFlush(`${msg.command} ${msg.data}`);
      pendulum.update(msg.data);
      break;
    case "PAUSE":
      pendulum.pause();
      break;
    case "STOP":
      pendulum.pause();
      pendulum.init();
      break;
    case "PLAY":
      pendulum.start();
      break;
    case "SHUTDOWN":
      console.log("Worker received shutdown command. Cleaning up...");
      await pendulum.dispose();
      process.exit(0);
  }
});
