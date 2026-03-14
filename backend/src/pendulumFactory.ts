import type mqtt from "mqtt";
import { Pendulum } from "./pendulum.js";

export type PendulumFactory = (
  angle: number,
  length: number,
  client: mqtt.MqttClient | null,
) => Pendulum;

export const pendulumFactory: PendulumFactory = (
  angle: number,
  length: number,
  client: mqtt.MqttClient | null = null,
) => new Pendulum(angle, length, client);
