import { Pendulum } from "./pendulum.js";
import type { PendulumMqttClient } from "./mqttClient.js";
import type { Point } from "@pendulum-simulation/common";

export type PendulumFactory = (
  angle: number,
  length: number,
  mass: number,
  pivotPosition: Point,
  client: PendulumMqttClient | null,
) => Pendulum;

export const pendulumFactory: PendulumFactory = (
  angle: number,
  length: number,
  mass: number,
  pivotPosition: Point,
  client: PendulumMqttClient | null = null,
) => {
  const pendulum = new Pendulum(angle, length, mass, pivotPosition, client);
  client?.setOnPosition(pendulum.onPosition.bind(pendulum));
  client?.setOnCommand(pendulum.onCommand.bind(pendulum));
  client?.setOnStatus(pendulum.onStatus.bind(pendulum));
  return pendulum;
};
