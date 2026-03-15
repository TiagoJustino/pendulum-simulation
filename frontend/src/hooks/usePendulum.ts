import { useEffect } from "react";
import {
  useMutation,
  type UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import type {
  InitPendulumRequestDto,
  InitPendulumResponseDto,
  Point,
} from "@pendulum-simulation/common";

const API_BASE = "http://localhost:3000";

export const useInitPendulum = (body: InitPendulumRequestDto) => {
  const mutation: UseMutationResult<
    InitPendulumResponseDto,
    Error,
    InitPendulumRequestDto
  > = useMutation({
    mutationFn: (dto: InitPendulumRequestDto) =>
      fetch(`${API_BASE}/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    mutation.mutate(body);
  }, [body.angle, body.length]);

  return mutation;
};

/**
 * Deprecated in favor of useMqttSubscribe
 */
export const useGetPosition = () =>
  useQuery<Point>({
    queryKey: ["position"],
    queryFn: () => fetch(`${API_BASE}/position`).then((res) => res.json()),
    refetchInterval: 100,
  });
