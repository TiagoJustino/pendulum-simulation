import { Pendulum } from "./pendulum.js";
import type { PendulumMqttClient } from "./MqttClient.js";
import type { Point } from "@pendulum-simulation/common";

export type PendulumFactory = (
  angle: number,
  length: number,
  pivotPosition: Point,
  client: PendulumMqttClient | null,
) => Pendulum;

export const pendulumFactory: PendulumFactory = (
  angle: number,
  length: number,
  pivotPosition: Point,
  client: PendulumMqttClient | null = null,
) => {
  const pendulum = new Pendulum(angle, length, pivotPosition, client);
  client?.setOnPosition(pendulum.onPosition.bind(pendulum));
  client?.setOnCommand(pendulum.onCommand.bind(pendulum));
  return pendulum;
};
