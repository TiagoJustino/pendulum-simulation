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

export type PendulumListItemDto = {
  id: string;
  config: InitPendulumRequestDto;
};

export type ListPendulumResponseDto = {
  pendulums: PendulumListItemDto[];
  state: "running" | "paused" | "stopped";
};
