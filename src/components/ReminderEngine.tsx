"use client";

import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import type { Task } from "@/lib/types";
import { addMinutes, combineDateTime } from "@/lib/date";
import ReminderModal from "./ReminderModal";

/** Plays a simple repeating alarm tone using the Web Audio API (no audio files needed). */
function useAlarmSound(active: boolean, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const beep = () => {
      if (ctx.state === "closed") return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    };

    beep();
    timerRef.current = setInterval(beep, 900);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      ctx.close().catch(() => {});
    };
  }, [active, enabled]);
}

export default function ReminderEngine() {
  const { tasks, settings, updateTask } = useAppData();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const shownIds = useRef<Set<number>>(new Set());
  const permissionRequested = useRef(false);

  useAlarmSound(!!activeTask, settings?.soundEnabled ?? true);

  useEffect(() => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const check = () => {
      if (activeTask) return; // one alarm at a time
      const now = new Date();

      const due = tasks
        .filter((t) => t.reminderEnabled && (t.status === "scheduled" || t.status === "snoozed"))
        .filter((t) => !shownIds.current.has(t.id))
        .filter((t) => {
          const dueAt = t.status === "snoozed" && t.snoozeUntil
            ? new Date(t.snoozeUntil)
            : combineDateTime(t.date, t.time);
          return dueAt.getTime() <= now.getTime();
        })
        .sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date));

      const next = due[0];
      if (next) {
        shownIds.current.add(next.id);
        setActiveTask(next);
        updateTask(next.id, { status: "triggered" }).catch(() => {});

        if (settings?.notificationsEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            const n = new Notification("Dev Reminder", {
              body: next.title,
              tag: `task-${next.id}`,
            });
            n.onclick = () => window.focus();
          } catch {
            // ignore notification errors
          }
        }
        if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([200, 100, 200]);
        }
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [tasks, activeTask, settings, updateTask]);

  const handleTurnOff = () => {
    if (!activeTask) return;
    updateTask(activeTask.id, { status: "completed" }).catch(() => {});
    setActiveTask(null);
  };

  const handleSnooze = (minutes: number) => {
    if (!activeTask) return;
    const snoozeUntil = addMinutes(new Date(), minutes).toISOString();
    shownIds.current.delete(activeTask.id);
    updateTask(activeTask.id, { status: "snoozed", snoozeUntil, snoozeDuration: minutes }).catch(() => {});
    setActiveTask(null);
  };

  if (!activeTask) return null;

  return (
    <ReminderModal
      task={activeTask}
      timeFormat={settings?.timeFormat ?? "12"}
      defaultSnooze={settings?.defaultSnooze ?? 10}
      onSnooze={handleSnooze}
      onTurnOff={handleTurnOff}
    />
  );
}
