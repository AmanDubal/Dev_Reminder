import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getOrCreateSettings() {
  const existing = await db.select().from(settings).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(settings).values({}).returning();
  return created;
}

export async function GET() {
  const row = await getOrCreateSettings();
  return NextResponse.json({ settings: row });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const current = await getOrCreateSettings();
  const b = body as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  if (typeof b.defaultSnooze === "number") patch.defaultSnooze = b.defaultSnooze;
  if (typeof b.notificationsEnabled === "boolean") patch.notificationsEnabled = b.notificationsEnabled;
  if (typeof b.soundEnabled === "boolean") patch.soundEnabled = b.soundEnabled;
  if (typeof b.vibrationEnabled === "boolean") patch.vibrationEnabled = b.vibrationEnabled;
  if (b.timeFormat === "12" || b.timeFormat === "24") patch.timeFormat = b.timeFormat;
  if (typeof b.theme === "string") patch.theme = b.theme;

  const [updated] = await db
    .update(settings)
    .set(patch)
    .where(eq(settings.id, current.id))
    .returning();

  return NextResponse.json({ settings: updated });
}
