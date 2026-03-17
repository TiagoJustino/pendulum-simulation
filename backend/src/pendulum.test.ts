import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { Pendulum } from "./pendulum.js";

describe("Pendulum", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe("nextPosition()", () => {
    it("bob moves from initial position after one step", () => {
      const pendulum = new Pendulum(30, 450, 25, { x: 0, y: 0 });
      const initial = { ...pendulum.getRelativeBobPosition() };

      pendulum.nextPosition();

      expect(pendulum.getRelativeBobPosition()).not.toEqual(initial);
      pendulum.dispose();
    });

    it("bob swings past middle position to the opposite side", () => {
      const pendulum = new Pendulum(30, 450, 25, { x: 0, y: 0 });
      const initialX = pendulum.getRelativeBobPosition().x;
      expect(initialX).toBeGreaterThan(0);

      // Run until x goes negative (bob crossed equilibrium)
      let crossedMiddle = false;
      for (let i = 0; i < 500; i++) {
        pendulum.nextPosition();
        if (pendulum.getRelativeBobPosition().x < 0) {
          crossedMiddle = true;
          break;
        }
      }

      expect(crossedMiddle).toBe(true);
      pendulum.dispose();
    });

    it("bob does not move when gravity is 0", () => {
      const pendulum = new Pendulum(30, 450, 25, { x: 0, y: 0 }, null, 0);
      const initial = { ...pendulum.getRelativeBobPosition() };

      pendulum.nextPosition();

      expect(pendulum.getRelativeBobPosition()).toEqual(initial);
      pendulum.dispose();
    });

    it("bob stays at rest when starting at angle 0", () => {
      const pendulum = new Pendulum(0, 450, 25, { x: 0, y: 0 });

      pendulum.nextPosition();
      const afterFirst = { ...pendulum.getRelativeBobPosition() };
      pendulum.nextPosition();

      expect(pendulum.getRelativeBobPosition()).toEqual(afterFirst);
      pendulum.dispose();
    });
  });
});
