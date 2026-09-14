// Date/time helpers. Dates are always handled as local, machine-readable
// YYYY-MM-DD strings and HH:MM 24-hour time strings to avoid timezone drift.

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function nowTimeStr(d: Date = new Date()): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Combine a YYYY-MM-DD date and HH:MM time string into a local Date object. */
export function combineDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export function formatTime(time: string, format: "12" | "24" = "12"): string {
  const [hhStr, mmStr] = time.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return time;
  if (format === "24") {
    return `${pad2(hh)}:${pad2(mm)}`;
  }
  const period = hh >= 12 ? "PM" : "AM";
  let hour12 = hh % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${pad2(mm)} ${period}`;
}

export function formatFullDate(date: string): string {
  const d = combineDateTime(date, "00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: string): string {
  const d = combineDateTime(date, "00:00");
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

export function isPastDateTime(date: string, time: string, now: Date = new Date()): boolean {
  return combineDateTime(date, time).getTime() < now.getTime();
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Build a Mon-Sun calendar grid (array of weeks, each week is 7 cells) for a given month. */
export function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  // JS getDay(): 0=Sun..6=Sat. Convert to Mon-first index (0=Mon..6=Sun)
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${year}-${pad2(month + 1)}-${pad2(day)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
