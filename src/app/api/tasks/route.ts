import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(tasks)
    .orderBy(asc(tasks.date), asc(tasks.time));
  return NextResponse.json({ tasks: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, date, time, reminderEnabled, snoozeDuration } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Please enter a task name." }, { status: 400 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Please select a valid date." }, { status: 400 });
  }
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Please select a valid time." }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      title: title.trim(),
      date,
      time,
      reminderEnabled: typeof reminderEnabled === "boolean" ? reminderEnabled : true,
      snoozeDuration: typeof snoozeDuration === "number" ? snoozeDuration : 10,
    })
    .returning();

  return NextResponse.json({ task: created }, { status: 201 });
}
