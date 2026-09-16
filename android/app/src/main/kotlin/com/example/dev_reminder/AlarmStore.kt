package com.example.dev_reminder

import android.app.*
import android.content.*
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/** Native scheduling survives Flutter being closed. A powered-off/force-stopped
 * phone cannot execute alarms. Reboot restores future alarms after unlock.
 * https://developer.android.com/develop/background-work/services/alarms */
object AlarmStore {
    const val CHANNEL = "dev_reminder_native_alarm_v1"
    const val CHANGED = "com.example.dev_reminder.ALARM_CHANGED"
    const val TIMEOUT = 5 * 60 * 1000L
    fun prefs(c: Context) = c.getSharedPreferences("native_alarms", Context.MODE_PRIVATE)
    fun jobs(c: Context): List<JSONObject> = prefs(c).all.filterKeys { it.startsWith("job_") }
        .values.mapNotNull { runCatching { JSONObject(it as String) }.getOrNull() }
    fun get(c: Context, id: Int): JSONObject? = prefs(c).getString("job_$id", null)?.let { JSONObject(it) }
    fun put(c: Context, j: JSONObject) {
        prefs(c).edit().putString("job_${j.getInt("notificationId")}", j.toString()).commit()
    }
    fun channel(c: Context) {
        if (Build.VERSION.SDK_INT >= 26) {
            val channel = NotificationChannel(CHANNEL, "Task alarms", NotificationManager.IMPORTANCE_HIGH)
            channel.description = "Full-screen task alarms; audio is controlled by the alarm service"
            channel.setSound(null, null)
            channel.enableVibration(false)
            channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            c.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }
    private fun trigger(c: Context, j: JSONObject): PendingIntent = PendingIntent.getBroadcast(
        c, j.getInt("notificationId"), Intent(c, AlarmReceiver::class.java)
            .setAction("FIRE").putExtra("id", j.getInt("notificationId"))
            .putExtra("generation", j.getString("generation")),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    fun screen(c: Context, id: Int): PendingIntent = PendingIntent.getActivity(
        c, id, Intent(c, AlarmActivity::class.java).putExtra("id", id)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    fun schedule(c: Context, j: JSONObject) {
        require(j.getLong("at") > System.currentTimeMillis()) { "Choose a future reminder time." }
        val am = c.getSystemService(AlarmManager::class.java)
        check(Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) {
            "Enable Alarms & reminders in Settings, then save the task again."
        }
        j.put("state", "scheduled").put("generation", UUID.randomUUID().toString())
        // Register first: never save a pending alarm that AlarmManager rejected.
        am.setAlarmClock(AlarmManager.AlarmClockInfo(j.getLong("at"), screen(c, j.getInt("notificationId"))), trigger(c, j))
        put(c, j)
        AlarmService.running?.remove(j.getInt("notificationId"))
        changed(c)
    }
    fun cancel(c: Context, id: Int) {
        val old = get(c, id)
        if (old != null) c.getSystemService(AlarmManager::class.java).cancel(trigger(c, old))
        prefs(c).edit().remove("job_$id").commit()
        AlarmService.running?.remove(id)
        c.getSystemService(NotificationManager::class.java).cancel(id)
        changed(c)
    }
    fun changed(c: Context) { c.sendBroadcast(Intent(CHANGED).setPackage(c.packageName)) }
    fun events(c: Context) = JSONArray(prefs(c).getString("events", "[]"))
    fun record(c: Context, j: JSONObject, status: String) {
        val events = events(c)
        events.put(JSONObject().put("eventId", UUID.randomUUID().toString())
            .put("taskId", j.getString("taskId")).put("status", status)
            .put("at", j.getLong("at")))
        prefs(c).edit().putString("events", events.toString()).commit()
    }
    fun ack(c: Context, id: String) {
        val old = events(c); val keep = JSONArray()
        for (i in 0 until old.length()) if (old.getJSONObject(i).getString("eventId") != id) keep.put(old.getJSONObject(i))
        prefs(c).edit().putString("events", keep.toString()).commit()
    }
    fun finish(c: Context, id: Int, status: String) {
        val j = get(c, id) ?: return
        if (j.optString("state") != "ringing") return
        if (status == "snoozed") {
            j.put("at", System.currentTimeMillis() + j.optInt("snooze", 10).coerceIn(1, 60) * 60000L)
            j.put("snoozed", true)
            schedule(c, j) // Keep the current alarm if permission was revoked.
            record(c, j, status)
            AlarmService.running?.remove(id)
        } else {
            record(c, j, status)
            cancel(c, id)
        }
        changed(c)
    }
    fun restore(c: Context, wallClockChanged: Boolean = false) {
        val now = System.currentTimeMillis()
        for (j in jobs(c)) {
            val id = j.getInt("notificationId")
            if (j.optString("state") == "ringing") {
                if (AlarmService.running == null) { record(c, j, "missed"); cancel(c, id) }
                continue
            }
            if (wallClockChanged && !j.optBoolean("snoozed")) {
                val parser = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US)
                parser.isLenient = false
                j.put("at", parser.parse(j.getString("date") + " " + j.getString("time"))!!.time)
            }
            if (j.getLong("at") <= now) {
                record(c, j, "missed"); cancel(c, id)
            } else {
                // Retain pending data if exact-alarm permission is temporarily unavailable.
                runCatching { schedule(c, j) }
            }
        }
    }
}

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED,
            AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED -> AlarmStore.restore(context)
            Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED -> AlarmStore.restore(context, true)
            "FIRE" -> {
                val j = AlarmStore.get(context, intent.getIntExtra("id", -1)) ?: return
                if (j.optString("state") != "scheduled" || j.optString("generation") != intent.getStringExtra("generation")) return
                val service = Intent(context, AlarmService::class.java).putExtra("id", j.getInt("notificationId"))
                try {
                    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(service) else context.startService(service)
                } catch (_: RuntimeException) {
                    AlarmStore.record(context, j, "missed")
                    AlarmStore.cancel(context, j.getInt("notificationId"))
                }
            }
            "snoozed", "dismissed" -> {
                runCatching { AlarmStore.finish(context, intent.getIntExtra("id", -1), intent.action!!) }
            }
        }
    }
}
