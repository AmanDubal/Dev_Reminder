"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import TaskRow from "./TaskRow";
import TaskComposer from "./TaskComposer";
import EmptyState from "./EmptyState";
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  buildMonthGrid,
  formatFullDate,
  pad2,
  todayStr,
} from "@/lib/date";

export default function CalendarView() {
  const { tasks, settings } = useAppData();
  const searchParams = useSearchParams();
  const today = todayStr();
  const initialDate = searchParams.get("date") || today;

  const [viewYear, setViewYear] = useState(() => Number(initialDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => Number(initialDate.slice(5, 7)) - 1);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const taskCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => map.set(t.date, (map.get(t.date) ?? 0) + 1));
    return map;
  }, [tasks]);

  const weeks = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tasks, selectedDate]
  );

  const timeFormat = settings?.timeFormat ?? "12";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6">
      <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
      <p className="mt-1 text-sm text-slate-400">Schedule tasks for any future date.</p>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between px-1">
          <button
            onClick={goPrevMonth}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            ‹
          </button>
          <p className="text-sm font-bold text-slate-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            onClick={goNextMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            ›
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {weeks.flat().map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const isToday = cell === today;
            const isSelected = cell === selectedDate;
            const count = taskCountByDate.get(cell) ?? 0;
            const dayNum = Number(cell.slice(8, 10));
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(cell)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition ${
                  isSelected
                    ? "bg-orange-500 text-white"
                    : isToday
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pad2(dayNum)}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                      isSelected || isToday ? "bg-white" : "bg-orange-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
          {formatFullDate(selectedDate)}
          {selectedDate === today ? " · Today" : ""}
        </h2>

        <div className="mt-3 flex flex-col gap-3">
          {selectedTasks.length === 0 ? (
            <EmptyState message="No tasks scheduled for this date." />
          ) : (
            selectedTasks.map((task) => <TaskRow key={task.id} task={task} timeFormat={timeFormat} />)
          )}
        </div>

        <TaskComposer date={selectedDate} />
      </div>
    </div>
  );
}
