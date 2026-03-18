import "dotenv/config";
import mqtt from "mqtt";
import { createApp } from "./createApp.js";
import type { PendulumListItemDto } from "@pendulum-simulation/common";

const PORT = process.env.PORT || 3000;
const mqttClient = await mqtt.connectAsync(
  process.env.MQTT_URL ?? "mqtt://127.0.0.1:1883",
);

const publishRoster = (pendulums: PendulumListItemDto[]) => {
  mqttClient.publish("pendulum/roster", JSON.stringify({ pendulums }));
};

const server = createApp(publishRoster).listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Optional: Handle unhandled rejections globally
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
