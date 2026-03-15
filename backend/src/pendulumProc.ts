import { pendulumFactory } from "./pendulumFactory.js";
import mqtt from "mqtt";
import { PendulumMqttClient } from "./MqttClient.js";

if (process.argv.length < 5) {
  console.error(
    "Usage: node pendulumProc.js <id> <angle> <length> <pivotX> <pivotY>",
  );
  process.exit(1);
}

const id: string = process.argv[2]!;
const angleStr: string = process.argv[3]!;
const lengthStr: string = process.argv[4]!;
const pivotXStr: string = process.argv[5]!;
const pivotYStr: string = process.argv[6]!;

const angle = parseFloat(angleStr);
const length = parseFloat(lengthStr);
const pivotX = parseFloat(pivotXStr);
const pivotY = parseFloat(pivotYStr);

const mqttClient = await mqtt.connectAsync("mqtt://127.0.0.1:1883");
const pendulumMqttClient = new PendulumMqttClient(id, mqttClient);
const pendulum = pendulumFactory(
  angle,
  length,
  { x: pivotX, y: pivotY },
  pendulumMqttClient,
);

process.on("message", (msg: any) => {
  switch (msg.command) {
    case "POSITION":
      console.log(JSON.stringify(pendulum.getRelativeBobPosition()));
      break;
    case "UPDATE":
      process.stderr.write(`${msg.command} ${msg.data}\n`);
      pendulum.update(msg.data);
      break;
    case "SHUTDOWN":
      console.log("Worker received shutdown command. Cleaning up...");
      pendulum.dispose();
      process.exit(0);
  }
});
