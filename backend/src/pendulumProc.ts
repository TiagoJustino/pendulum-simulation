import { pendulumFactory } from "./pendulumFactory.js";
import mqtt from "mqtt";

if (process.argv.length < 4) {
  console.error("Usage: node pendulumProc.js <angle> <length>");
  process.exit(1);
}

const angleStr: string = process.argv[2]!;
const lengthStr: string = process.argv[3]!;

const angle = parseFloat(angleStr);
const length = parseFloat(lengthStr);

const mqttClient = await mqtt.connectAsync("mqtt://127.0.0.1:1883");
const pendulum = pendulumFactory(angle, length, mqttClient);

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
