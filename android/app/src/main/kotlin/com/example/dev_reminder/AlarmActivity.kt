package com.example.dev_reminder

import android.app.Activity
import android.content.*
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.os.*
import android.view.*
import android.widget.*
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs
import kotlin.math.min

/** Dedicated lock-screen activity avoids Flutter cold-start navigation races.
 * https://developer.android.com/develop/ui/views/notifications/time-sensitive
 * Unlocked devices may show a heads-up notification instead, as Android decides. */
class AlarmActivity : Activity() {
    private val navy = Color.rgb(30, 33, 89)
    private var shownId: Int? = null
    private lateinit var muteLabel: TextView
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { refresh() }
    }
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true) }
        else window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or WindowManager.LayoutParams.FLAG_FULLSCREEN)
        window.navigationBarColor = navy
        window.statusBarColor = navy
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(receiver, IntentFilter(AlarmStore.CHANGED), RECEIVER_NOT_EXPORTED)
        else registerReceiver(receiver, IntentFilter(AlarmStore.CHANGED))
        refresh()
    }
    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent); setIntent(intent); refresh() }
    override fun onResume() { super.onResume(); refresh() }
    override fun onDestroy() { unregisterReceiver(receiver); super.onDestroy() }
    override fun onBackPressed() { AlarmService.running?.mute(); super.onBackPressed() }
    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    private fun text(value: String, size: Float, alpha: Float = 1f) = TextView(this).apply {
        text = value; textSize = size; setTextColor(Color.WHITE); this.alpha = alpha
        gravity = Gravity.CENTER; setPadding(dp(12), dp(6), dp(12), dp(6))
    }
    private fun refresh() {
        val id = AlarmService.running?.current
        if (id == null) { finish(); return }
        if (shownId == id && ::muteLabel.isInitialized) {
            muteLabel.text = if (AlarmService.running?.muted == true) "Alarm muted" else "Power button silences the alarm"
            return
        }
        shownId = id
        val j = AlarmStore.get(this, id) ?: run { finish(); return }
        val scroll = ScrollView(this).apply { setBackgroundColor(navy); isFillViewport = true }
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(16), dp(32), dp(16), dp(24))
        }
        scroll.addView(root)
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greeting = when (hour) { in 5..11 -> "Good morning! ☀"; in 12..16 -> "Good afternoon! ☀"; else -> "Good evening! ☾" }
        root.addView(text(greeting, 19f).apply { typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL) })
        root.addView(text(SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(j.getLong("at"))), 62f).apply {
            typeface = Typeface.create("sans-serif-thin", Typeface.NORMAL)
        })
        root.addView(text(SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date(j.getLong("at"))), 14f, .65f))
        root.addView(text(j.getString("title"), 23f).apply { setPadding(dp(16), dp(28), dp(16), dp(12)) })
        root.addView(Space(this), LinearLayout.LayoutParams(1, 0, 1f))
        root.addView(AlarmSlider(this) { snooze -> act(id, snooze) }, LinearLayout.LayoutParams(-1, dp(240)))
        root.addView(text("Slide left to snooze  •  Slide right to dismiss", 13f, .7f))
        // Real buttons provide TalkBack / keyboard alternatives to the gesture.
        val actions = LinearLayout(this).apply { gravity = Gravity.CENTER }
        for ((label, snooze) in listOf("Snooze ${j.optInt("snooze", 10)} min" to true, "Dismiss" to false)) {
            actions.addView(Button(this).apply {
                text = label; isAllCaps = false; setTextColor(Color.WHITE)
                background = GradientDrawable().apply { setColor(Color.TRANSPARENT); cornerRadius = dp(24).toFloat() }
                setOnClickListener { act(id, snooze) }
            }, LinearLayout.LayoutParams(0, dp(52), 1f))
        }
        root.addView(actions)
        root.addView(Space(this), LinearLayout.LayoutParams(1, 0, 1f))
        muteLabel = text(if (AlarmService.running?.muted == true) "Alarm muted" else "Power button silences the alarm", 12f, .5f)
        root.addView(muteLabel)
        setContentView(scroll)
    }
    private fun act(id: Int, snooze: Boolean) {
        try { AlarmStore.finish(this, id, if (snooze) "snoozed" else "dismissed"); refresh() }
        catch (e: Exception) { Toast.makeText(this, e.message ?: "Unable to snooze. Check alarm permissions.", Toast.LENGTH_LONG).show() }
    }
}

private class AlarmSlider(context: Context, val onAction: (Boolean) -> Unit) : View(context) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private var drag = 0f
    private var downX = 0f
    private var tracking = false
    private val density = resources.displayMetrics.density
    private val travel get() = (width / 2f - 40 * density).coerceAtLeast(1f)
    init { contentDescription = "Slide left to snooze or right to dismiss. Buttons are available below." }
    override fun onDraw(c: Canvas) {
        val x = width / 2f; val y = height / 2f
        paint.color = Color.rgb(51, 54, 106); paint.style = Paint.Style.FILL
        c.drawCircle(x, y, min(width * .33f, height * .44f), paint)
        paint.color = Color.rgb(175, 176, 210); paint.textSize = 22 * density; paint.textAlign = Paint.Align.CENTER
        c.drawText("zZ", x - travel, y + 7 * density, paint)
        c.drawText("×", x + travel, y + 7 * density, paint)
        paint.color = Color.WHITE
        c.drawCircle(x + drag, y, 28 * density, paint)
        paint.color = Color.rgb(51, 54, 106); paint.style = Paint.Style.STROKE; paint.strokeWidth = 1.8f * density
        val cx = x + drag; val r = 11 * density
        c.drawCircle(cx, y, r, paint)
        c.drawLine(cx, y, cx, y - 7 * density, paint)
        c.drawLine(cx, y, cx + 5 * density, y + 2 * density, paint)
        c.drawLine(cx - r, y - r, cx - 6 * density, y - 14 * density, paint)
        c.drawLine(cx + r, y - r, cx + 6 * density, y - 14 * density, paint)
        paint.style = Paint.Style.FILL
    }
    override fun onTouchEvent(e: MotionEvent): Boolean {
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                if (abs(e.x - width / 2f) > 44 * density || abs(e.y - height / 2f) > 44 * density) return false
                tracking = true; downX = e.x; parent.requestDisallowInterceptTouchEvent(true)
            }
            MotionEvent.ACTION_MOVE -> if (tracking) { drag = (e.x - downX).coerceIn(-travel, travel); invalidate() }
            MotionEvent.ACTION_UP -> if (tracking) {
                val completed = abs(drag) >= travel * .72f
                val left = drag < 0
                reset()
                if (completed) { performHapticFeedback(HapticFeedbackConstants.CONFIRM); onAction(left) }
                else performClick()
            }
            MotionEvent.ACTION_CANCEL -> reset()
        }
        return true
    }
    private fun reset() { tracking = false; drag = 0f; parent.requestDisallowInterceptTouchEvent(false); invalidate() }
    override fun performClick(): Boolean { super.performClick(); return true }
}
