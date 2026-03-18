import type { InitPendulumRequestDto } from "@pendulum-simulation/common";

export function validatePendulumInput(
  body: unknown,
): { data: InitPendulumRequestDto } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const { angle, length, mass, pivotPosition } = body as Record<
    string,
    unknown
  >;

  if (typeof angle !== "number" || !isFinite(angle)) {
    return { error: "angle must be a finite number" };
  }

  if (typeof length !== "number" || !isFinite(length) || length <= 0) {
    return { error: "length must be a positive finite number" };
  }

  if (typeof mass !== "number" || !isFinite(mass) || mass <= 0) {
    return { error: "mass must be a positive finite number" };
  }

  if (typeof pivotPosition !== "object" || pivotPosition === null) {
    return { error: "pivotPosition must be an object with x and y" };
  }

  const { x, y } = pivotPosition as Record<string, unknown>;

  if (typeof x !== "number" || !isFinite(x)) {
    return { error: "pivotPosition.x must be a finite number" };
  }

  if (typeof y !== "number" || !isFinite(y)) {
    return { error: "pivotPosition.y must be a finite number" };
  }

  return {
    data: { angle, length, mass, pivotPosition: { x, y } },
  };
}

export function validateGravityInput(
  body: unknown,
): { data: { gravity: number } } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const { gravity } = body as Record<string, unknown>;

  if (typeof gravity !== "number" || !isFinite(gravity)) {
    return { error: "gravity must be a finite number" };
  }

  if (gravity < 1 || gravity > 20) {
    return { error: "gravity must be between 1 and 20" };
  }

  return { data: { gravity } };
}

export function validateWindInput(
  body: unknown,
): { data: { wind: number } } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const { wind } = body as Record<string, unknown>;

  if (typeof wind !== "number" || !isFinite(wind)) {
    return { error: "wind must be a finite number" };
  }

  if (wind < 0 || wind > 40) {
    return { error: "wind must be between 0 and 40" };
  }

  return { data: { wind } };
}
