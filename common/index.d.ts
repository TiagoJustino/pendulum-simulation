export type Point = {
  x: number;
  y: number;
};

export type InitPendulumRequestDto = {
  angle: number;
  length: number;
  mass: number;
  pivotPosition: Point;
};

export type AbsolutePosition = {
  pivotPosition: Point;
  bobPosition: Point;
  mass: number;
};

export type InitPendulumResponseDto = {
  id: string;
};

export type ClearResponseDto = {
  success: boolean;
};
