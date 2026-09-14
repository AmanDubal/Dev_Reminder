"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import TaskRow from "./TaskRow";
import TaskComposer from "./TaskComposer";
import EmptyState from "./EmptyState";
import { formatFullDate, formatShortDate, todayStr } from "@/lib/date";

export default function HomeDashboard() {
  const { tasks, settings, loading } = useAppData();
  const [today, setToday] = useState(todayStr());

  // Keep "today" correct if the tab stays open across midnight.
  useEffect(() => {
    const id = setInterval(() => setToday(todayStr()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todaysTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tasks, today]
  );

  const upcoming = useMemo(() => {
    const map = new Map<string, number>();
    tasks
      .filter((t) => t.date > today)
      .forEach((t) => map.set(t.date, (map.get(t.date) ?? 0) + 1));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 5);
  }, [tasks, today]);

  const timeFormat = settings?.timeFormat ?? "12";

  const completedCount = todaysTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6">
      <p className="text-sm font-semibold text-slate-400">{formatFullDate(today)}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Today&apos;s Tasks</h1>

      {todaysTasks.length > 0 && (
        <p className="mt-1 text-xs font-medium text-slate-400">
          {completedCount} of {todaysTasks.length} completed
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading tasks…</p>
        ) : todaysTasks.length === 0 ? (
          <EmptyState message="No tasks scheduled for today." />
        ) : (
          todaysTasks.map((task) => <TaskRow key={task.id} task={task} timeFormat={timeFormat} />)
        )}
      </div>

      <TaskComposer date={today} />

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Upcoming</h2>
        <Link href="/calendar" className="text-xs font-semibold text-orange-500 hover:underline">
          Open Calendar →
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-4 text-center text-xs text-slate-400">
            Nothing scheduled yet. Use the calendar to plan ahead.
          </p>
        ) : (
          upcoming.map(([date, count]) => (
            <Link
              key={date}
              href={`/calendar?date=${date}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300"
            >
              <span>{formatShortDate(date)}</span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                {count} task{count > 1 ? "s" : ""}
              </span>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/calendar"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          📅 Calendar
        </Link>
      </div>
    </div>
  );
}
