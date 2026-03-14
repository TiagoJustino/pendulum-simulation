import type { Point } from '@pendulum-simulation/common';

/*
## References:
- The Code Train - Simple Pendulum Simulation: https://www.youtube.com/watch?v=NBWMtlbbOag
- The Nature of Code - https://natureofcode.com/oscillation/#the-pendulum

      angle
       .
  l   /| y
     / |
    O -
      x
## position
sin(angle) = x / l => x = l * sin(angle)
cos(angle) = y / l => y = l * cos(angle)

 */

const GRAVITY = 1;

export class Pendulum {
  private bobPosition: Point;
  // angle in radians
  private angle: number;
  private angleVelocity: number;
  private intervalId;

  constructor(
    // angle in degrees
    angle: number,
    private length: number,
  ) {
    this.angle = angle * (Math.PI / 180);
    // initial bob position is calculated based on the initial angle and length
    this.bobPosition = {
      x: length * Math.cos(this.angle),
      y: length * Math.sin(this.angle),
    };
    // initially, the pendulum is at rest, so angle velocity is 0
    this.angleVelocity = 0;
    // update the pendulum position every 15ms
    this.intervalId = setInterval(() => this.nextPosition(), 15);
  }

  dispose(): void {
    clearInterval(this.intervalId);
  }

  getBobPosition(): Point {
    return this.bobPosition;
  }

  // Update the pendulum's position to next frame
  nextPosition(): void {
    const resultantForce = GRAVITY * Math.sin(this.angle);
    const angleAccel = (-1 * resultantForce) / this.length;
    this.angleVelocity += angleAccel;
    this.angle += this.angleVelocity;
    this.bobPosition.x = this.length * Math.sin(this.angle);
    this.bobPosition.y = this.length * Math.cos(this.angle);
  }
}
