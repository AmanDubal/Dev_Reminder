"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { isPastDateTime, nowTimeStr, todayStr } from "@/lib/date";

interface TaskComposerProps {
  date: string;
  onDone?: () => void;
}

export default function TaskComposer({ date, onDone }: TaskComposerProps) {
  const { createTask } = useAppData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(() => nowTimeStr());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isToday = date === todayStr();
  const isPast = isToday && time ? isPastDateTime(date, time) : false;

  const reset = () => {
    setTitle("");
    setTime(nowTimeStr());
    setReminderEnabled(true);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!title.trim()) {
      setError("Please enter a task name.");
      return;
    }
    if (!time) {
      setError("Please select a time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createTask({ title: title.trim(), date, time, reminderEnabled });
      reset();
      setOpen(false);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3.5 text-sm font-semibold text-slate-500 transition hover:border-orange-400 hover:text-orange-500"
      >
        <span className="text-lg leading-none">+</span> Add Task
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          aria-label="Confirm task"
          onClick={handleConfirm}
          disabled={saving}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? "…" : "✓"}
        </button>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400"
        />
        <button
          type="button"
          title={reminderEnabled ? "Reminder on" : "Reminder off"}
          onClick={() => setReminderEnabled((v) => !v)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base transition ${
            reminderEnabled ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
          }`}
        >
          {reminderEnabled ? "🔔" : "🔕"}
        </button>
        <button
          aria-label="Cancel"
          onClick={handleCancel}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-100 hover:text-red-500"
        >
          🗑
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      {!error && isPast && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          This time has already passed today. The reminder will trigger immediately.
        </p>
      )}
    </div>
  );
}
