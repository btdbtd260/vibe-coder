import { useState, useCallback, useRef } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "prestige" | "error";
}

let nextId = 0;

export function useNotificationToast(durationMs = 3000) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = ++nextId;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [durationMs, dismiss],
  );

  return { toasts, notify, dismiss };
}
