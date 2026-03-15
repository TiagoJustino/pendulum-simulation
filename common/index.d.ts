export type Point = {
  x: number;
  y: number;
};

export type InitPendulumRequestDto = {
  angle: number;
  length: number;
  pivotPosition: Point;
};

export type AbsolutePosition = {
  pivotPosition: Point;
  bobPosition: Point;
};

export type InitPendulumResponseDto = {
  id: string;
};

export type ClearResponseDto = {
  success: boolean;
};
