export default function EmptyState({
  message = "No tasks scheduled for this day.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center">
      <p className="text-3xl">📋</p>
      <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
      <p className="mt-1 text-xs text-slate-400">Plan your day and stay productive.</p>
    </div>
  );
}
