import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  // Stored as YYYY-MM-DD (machine readable, timezone-agnostic)
  date: varchar("date", { length: 10 }).notNull(),
  // Stored as HH:MM in 24-hour format
  time: varchar("time", { length: 5 }).notNull(),
  // scheduled | triggered | snoozed | completed
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  snoozeDuration: integer("snooze_duration").notNull().default(10),
  snoozeUntil: timestamp("snooze_until", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  defaultSnooze: integer("default_snooze").notNull().default(10),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  vibrationEnabled: boolean("vibration_enabled").notNull().default(true),
  // "12" or "24"
  timeFormat: varchar("time_format", { length: 2 }).notNull().default("12"),
  theme: varchar("theme", { length: 10 }).notNull().default("light"),
});

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type SettingsRow = typeof settings.$inferSelect;
