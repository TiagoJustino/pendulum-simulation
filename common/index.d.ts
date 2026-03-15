export type Point = {
  x: number;
  y: number;
};

export type InitPendulumRequestDto = {
  angle: number;
  length: number;
}

export type InitPendulumResponseDto = {
  id: string;
};

export type ClearResponseDto = {
  success: boolean;
};
