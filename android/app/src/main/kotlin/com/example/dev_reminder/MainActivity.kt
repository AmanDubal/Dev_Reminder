package com.example.dev_reminder

import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import org.json.JSONObject

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "dev_reminder/alarms")
            .setMethodCallHandler { call, result ->
                try {
                    when (call.method) {
                        "schedule" -> {
                            val data = JSONObject(call.arguments as Map<*, *>)
                            AlarmStore.schedule(this, data)
                            result.success(null)
                        }
                        "cancel" -> {
                            AlarmStore.cancel(this, (call.arguments as Number).toInt())
                            result.success(null)
                        }
                        "events" -> result.success(AlarmStore.events(this).toString())
                        "ack" -> {
                            AlarmStore.ack(this, call.arguments as String)
                            result.success(null)
                        }
                        "restore" -> { AlarmStore.restore(this); result.success(null) }
                        "sound" -> {
                            AlarmStore.prefs(this).edit().putBoolean("sound", call.arguments as Boolean).commit()
                            if (call.arguments == false) AlarmService.running?.mute()
                            result.success(null)
                        }
                        "permissions" -> {
                            val nm = getSystemService(NotificationManager::class.java)
                            val am = getSystemService(AlarmManager::class.java)
                            AlarmStore.channel(this)
                            result.success(mapOf(
                                "notifications" to (Build.VERSION.SDK_INT < 24 || nm.areNotificationsEnabled()),
                                "exact" to (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()),
                                "fullScreen" to (Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent()),
                                "channel" to (Build.VERSION.SDK_INT < 26 ||
                                    nm.getNotificationChannel(AlarmStore.CHANNEL).importance >= NotificationManager.IMPORTANCE_HIGH)
                            ))
                        }
                        "settings" -> {
                            val intent = when (call.arguments as String) {
                                "exact" -> if (Build.VERSION.SDK_INT >= 31)
                                    Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName")) else null
                                "fullScreen" -> if (Build.VERSION.SDK_INT >= 34)
                                    Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:$packageName")) else null
                                "channel" -> if (Build.VERSION.SDK_INT >= 26)
                                    Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
                                        .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
                                        .putExtra(Settings.EXTRA_CHANNEL_ID, AlarmStore.CHANNEL) else null
                                else -> Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                                    .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
                            }
                            if (intent != null) startActivity(intent)
                            result.success(null)
                        }
                        else -> result.notImplemented()
                    }
                } catch (e: Exception) {
                    result.error("ALARM_ERROR", e.message, null)
                }
            }
    }
}
