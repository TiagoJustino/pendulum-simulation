import { useEffect } from "react";
import {
  useMutation,
  type UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import type {
  ClearResponseDto,
  InitPendulumRequestDto,
  InitPendulumResponseDto,
  Point,
} from "@pendulum-simulation/common";

const API_BASE = "http://localhost:3000";

export const useInitPendulum = (
  body: InitPendulumRequestDto,
  enabled = true,
) => {
  const mutation: UseMutationResult<
    InitPendulumResponseDto,
    Error,
    InitPendulumRequestDto
  > = useMutation({
    mutationFn: async (dto: InitPendulumRequestDto) => {
      console.log("useInitPendulum", JSON.stringify(dto));
      const res = await fetch(`${API_BASE}/add-pendulum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      return await res.json();
    },
  });

  useEffect(() => {
    if (enabled) {
      mutation.mutate(body);
    }
  }, [body.angle, body.length, enabled]);

  return mutation;
};

export const useUpdatePendulum = (id: string) =>
  useMutation({
    mutationFn: async (dto: InitPendulumRequestDto) => {
      console.log('useUpdatePendulum', JSON.stringify(dto));
      const res = await fetch(`${API_BASE}/pendulum/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      return await res.json();
    },
  });

export const useDeletePendulum = (id: string) =>
  useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/pendulum/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    },
  });

export const useClear = () => {
  const mutation = useMutation<ClearResponseDto>({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/pendulum`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, [mutation.mutate]);

  return mutation;
};

/**
 * @Deprecated - use useMqttSubscribe
 */
export const useGetPosition = () =>
  useQuery<Point>({
    queryKey: ["position"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/position`);
      return await res.json();
    },
    refetchInterval: 100,
  });
