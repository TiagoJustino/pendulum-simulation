import { pendulumFactory } from "./pendulumFactory.js";
import mqtt from "mqtt";
import { PendulumMqttClient } from "./MqttClient.js";

if (process.argv.length < 5) {
  console.error("Usage: node pendulumProc.js <id> <angle> <length>");
  process.exit(1);
}

const id: string = process.argv[2]!;
const angleStr: string = process.argv[3]!;
const lengthStr: string = process.argv[4]!;

const angle = parseFloat(angleStr);
const length = parseFloat(lengthStr);

const mqttClient = await mqtt.connectAsync("mqtt://127.0.0.1:1883");
const pendulumMqttClient = new PendulumMqttClient(id, mqttClient);
const pendulum = pendulumFactory(angle, length, pendulumMqttClient);

process.on("message", (msg: any) => {
  switch (msg.command) {
    case "POSITION":
      console.log(JSON.stringify(pendulum.getBobPosition()));
      break;
    case "SHUTDOWN":
      console.log("Worker received shutdown command. Cleaning up...");
      pendulum.dispose();
      process.exit(0);
  }
});
