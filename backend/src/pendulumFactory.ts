import { Pendulum } from "./pendulum.js";
import type { PendulumMqttClient } from "./MqttClient.js";

export type PendulumFactory = (
  angle: number,
  length: number,
  client: PendulumMqttClient | null,
) => Pendulum;

export const pendulumFactory: PendulumFactory = (
  angle: number,
  length: number,
  client: PendulumMqttClient | null = null,
) => new Pendulum(angle, length, client);
