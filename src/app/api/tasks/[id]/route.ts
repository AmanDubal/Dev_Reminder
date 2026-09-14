import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["scheduled", "triggered", "snoozed", "completed"]);

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  const b = body as Record<string, unknown>;

  if (typeof b.title === "string") {
    if (b.title.trim().length === 0) {
      return NextResponse.json({ error: "Please enter a task name." }, { status: 400 });
    }
    patch.title = b.title.trim();
  }
  if (typeof b.date === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
      return NextResponse.json({ error: "Please select a valid date." }, { status: 400 });
    }
    patch.date = b.date;
  }
  if (typeof b.time === "string") {
    if (!/^\d{2}:\d{2}$/.test(b.time)) {
      return NextResponse.json({ error: "Please select a valid time." }, { status: 400 });
    }
    patch.time = b.time;
  }
  if (typeof b.status === "string") {
    if (!VALID_STATUSES.has(b.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = b.status;
  }
  if (typeof b.reminderEnabled === "boolean") patch.reminderEnabled = b.reminderEnabled;
  if (typeof b.snoozeDuration === "number") patch.snoozeDuration = b.snoozeDuration;
  if (b.snoozeUntil === null || typeof b.snoozeUntil === "string") {
    patch.snoozeUntil = b.snoozeUntil;
  }

  patch.updatedAt = new Date().toISOString();

  const [updated] = await db
    .update(tasks)
    .set(patch)
    .where(eq(tasks.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
