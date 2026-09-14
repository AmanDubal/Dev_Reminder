"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { SNOOZE_OPTIONS } from "@/lib/types";
import { formatTime } from "@/lib/date";

interface ReminderModalProps {
  task: Task;
  timeFormat: "12" | "24";
  defaultSnooze: number;
  onSnooze: (minutes: number) => void;
  onTurnOff: () => void;
}

export default function ReminderModal({
  task,
  timeFormat,
  defaultSnooze,
  onSnooze,
  onTurnOff,
}: ReminderModalProps) {
  const [snoozeChoice, setSnoozeChoice] = useState(defaultSnooze);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-[pulse_2s_ease-in-out_infinite] rounded-3xl bg-white p-8 text-center shadow-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-orange-500">DEV REMINDER</p>
        <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
          ⏰
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">{task.title}</h2>
        <p className="mt-1 text-lg font-medium text-slate-500">
          {formatTime(task.time, timeFormat)}
        </p>

        {!showSnoozeOptions ? (
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setShowSnoozeOptions(true)}
              className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Snooze
            </button>
            <button
              onClick={onTurnOff}
              className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Turn Off
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-3 text-sm text-slate-500">Snooze for:</p>
            <div className="grid grid-cols-3 gap-2">
              {SNOOZE_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSnoozeChoice(m)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    snoozeChoice === m
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {m < 60 ? `${m}m` : "1h"}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowSnoozeOptions(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Back
              </button>
              <button
                onClick={() => onSnooze(snoozeChoice)}
                className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
