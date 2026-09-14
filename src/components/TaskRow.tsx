"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import type { Task } from "@/lib/types";
import { formatTime } from "@/lib/date";

interface TaskRowProps {
  task: Task;
  timeFormat: "12" | "24";
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  triggered: "Ringing",
  snoozed: "Snoozed",
  completed: "Completed",
};

export default function TaskRow({ task, timeFormat }: TaskRowProps) {
  const { updateTask, deleteTask } = useAppData();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time);
  const [date, setDate] = useState(task.date);
  const [reminderEnabled, setReminderEnabled] = useState(task.reminderEnabled);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompleted = task.status === "completed";

  const toggleComplete = async () => {
    await updateTask(task.id, { status: isCompleted ? "scheduled" : "completed" }).catch(() => {});
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a task name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateTask(task.id, { title: title.trim(), time, date, reminderEnabled });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id).catch(() => {});
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={() => setReminderEnabled((v) => !v)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${
              reminderEnabled ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {reminderEnabled ? "🔔" : "🔕"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setTitle(task.title);
              setTime(task.time);
              setDate(task.date);
              setReminderEnabled(task.reminderEnabled);
              setError(null);
            }}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="ml-auto rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <button
        aria-label="Toggle complete"
        onClick={toggleComplete}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
          isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 text-transparent hover:border-orange-400"
        }`}
      >
        ✓
      </button>

      <button
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 text-left"
      >
        <p className={`truncate text-sm font-medium text-slate-900 ${isCompleted ? "line-through" : ""}`}>
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {STATUS_LABEL[task.status] ?? task.status}
          {task.reminderEnabled ? " · 🔔" : ""}
        </p>
      </button>

      <span className="shrink-0 text-sm font-semibold text-slate-600">
        {formatTime(task.time, timeFormat)}
      </span>

      {confirmDelete ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-semibold text-white"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          aria-label="Delete task"
          onClick={() => setConfirmDelete(true)}
          className="shrink-0 rounded-full p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
        >
          🗑
        </button>
      )}
    </div>
  );
}
