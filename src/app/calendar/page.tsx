import { Suspense } from "react";
import CalendarView from "@/components/CalendarView";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-5 py-10 text-sm text-slate-400">Loading calendar…</div>}>
      <CalendarView />
    </Suspense>
  );
}
