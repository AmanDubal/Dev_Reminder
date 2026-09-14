export type TaskStatus = "scheduled" | "triggered" | "snoozed" | "completed";

export interface Task {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  status: TaskStatus;
  reminderEnabled: boolean;
  snoozeDuration: number;
  snoozeUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  defaultSnooze: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timeFormat: "12" | "24";
  theme: string;
}

export interface CreateTaskInput {
  title: string;
  date: string;
  time: string;
  reminderEnabled?: boolean;
  snoozeDuration?: number;
}

export type UpdateTaskInput = Partial<{
  title: string;
  date: string;
  time: string;
  status: TaskStatus;
  reminderEnabled: boolean;
  snoozeDuration: number;
  snoozeUntil: string | null;
}>;

export const SNOOZE_OPTIONS = [5, 10, 15, 30, 60];
