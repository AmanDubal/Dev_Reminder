"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CreateTaskInput, Settings, Task, UpdateTaskInput } from "@/lib/types";

interface AppDataContextValue {
  tasks: Task[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: number, patch: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const DEFAULT_SETTINGS: Settings = {
  id: 0,
  defaultSnooze: 10,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  timeFormat: "12",
  theme: "light",
};

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong");
  }
  return data;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const refreshTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const data = await parseJsonOrThrow(res);
      setTasks(data.tasks ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await parseJsonOrThrow(res);
      setSettings(data.settings ?? DEFAULT_SETTINGS);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      setLoading(true);
      await Promise.all([refreshTasks(), refreshSettings()]);
      setLoading(false);
    })();
  }, [refreshTasks, refreshSettings]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTasks();
    }, 8000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await parseJsonOrThrow(res);
    setTasks((prev) =>
      [...prev, data.task as Task].sort((a, b) =>
        a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
      )
    );
    return data.task as Task;
  }, []);

  const updateTask = useCallback(async (id: number, patch: UpdateTaskInput) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await parseJsonOrThrow(res);
    setTasks((prev) => prev.map((t) => (t.id === id ? (data.task as Task) : t)));
    return data.task as Task;
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await parseJsonOrThrow(res);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await parseJsonOrThrow(res);
    setSettings(data.settings as Settings);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        tasks,
        settings,
        loading,
        error,
        refreshTasks,
        createTask,
        updateTask,
        deleteTask,
        updateSettings,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
