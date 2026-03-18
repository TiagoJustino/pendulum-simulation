import { useEffect, useRef, useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useMqttSubscribe } from "@artcom/mqtt-topping-react";
import type {
  ClearResponseDto,
  InitPendulumRequestDto,
  InitPendulumResponseDto,
} from "@pendulum-simulation/common";

export const API_BASE = "http://localhost:3000";

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
  }, [enabled]);

  return mutation;
};

export const useUpdatePendulum = (id: string) =>
  useMutation({
    mutationFn: async (dto: InitPendulumRequestDto) => {
      console.log("useUpdatePendulum", JSON.stringify(dto));
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

export const useCollisionCountdown = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useMqttSubscribe("pendulum/countdown", ({ seconds }: { seconds: number }) => {
    console.log(`[countdown] received pendulum/countdown: ${seconds}s`);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(seconds);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        console.log(
          `[countdown] tick: ${prev} -> ${prev !== null && prev > 1 ? prev - 1 : null}`,
        );
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  });

  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  };

  return { countdown, clearCountdown };
};

export const usePause = () =>
  useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/pause`, { method: "POST" });
      return await res.json();
    },
  });

export const useStop = () =>
  useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/stop`, { method: "POST" });
      return await res.json();
    },
  });

export const usePlay = () =>
  useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/play`, { method: "POST" });
      return await res.json();
    },
  });

export const useUpdateGravity = () =>
  useMutation({
    mutationFn: async (gravity: number) => {
      const res = await fetch(`${API_BASE}/gravity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gravity }),
      });
      return await res.json();
    },
  });

export const useUpdateWind = () =>
  useMutation({
    mutationFn: async (wind: number) => {
      const res = await fetch(`${API_BASE}/wind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wind }),
      });
      return await res.json();
    },
  });
