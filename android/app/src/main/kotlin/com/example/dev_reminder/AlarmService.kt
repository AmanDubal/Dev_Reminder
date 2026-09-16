package com.example.dev_reminder

import android.app.*
import android.content.*
import android.content.pm.ServiceInfo
import android.media.*
import android.os.*
import java.util.ArrayDeque

/** Power keys are reserved by Android. ACTION_SCREEN_OFF mutes when the power
 * button locks the screen (and also when the system turns the screen off).
 * Do not mute on Activity.onPause: lock-screen transitions can pause it. */
class AlarmService : Service() {
    companion object {
        var running: AlarmService? = null
            private set
        const val NOTIFICATION = 2147483000
    }
    val queue = ArrayDeque<Int>()
    val current: Int? get() = queue.peekFirst()
    var muted = false
        private set
    private var player: MediaPlayer? = null
    private var focus: AudioFocusRequest? = null
    private val handler = Handler(Looper.getMainLooper())
    private var wakeLock: PowerManager.WakeLock? = null
    private val timeout = Runnable { current?.let { AlarmStore.finish(this, it, "missed") } }
    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { if (i.action == Intent.ACTION_SCREEN_OFF) mute() }
    }
    private val focusListener = AudioManager.OnAudioFocusChangeListener {
        if (it <= AudioManager.AUDIOFOCUS_LOSS) mute()
    }
    override fun onCreate() {
        super.onCreate()
        running = this
        AlarmStore.channel(this)
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(screenReceiver, IntentFilter(Intent.ACTION_SCREEN_OFF), RECEIVER_NOT_EXPORTED)
        else registerReceiver(screenReceiver, IntentFilter(Intent.ACTION_SCREEN_OFF))
    }
    override fun onBind(intent: Intent?): IBinder? = null
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val id = intent?.getIntExtra("id", -1) ?: -1
        val j = AlarmStore.get(this, id)
        if (j == null) { if (queue.isEmpty()) stopSelf(); return START_NOT_STICKY }
        if (!queue.contains(id)) {
            j.put("state", "ringing")
            AlarmStore.put(this, j)
            queue.addLast(id)
            if (queue.size == 1) activate()
        }
        return START_NOT_STICKY
    }
    private fun action(id: Int, name: String): PendingIntent = PendingIntent.getBroadcast(
        this, id, Intent(this, AlarmReceiver::class.java).setAction(name).putExtra("id", id),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    private fun notification(fullScreen: Boolean): Notification {
        val id = current!!
        val j = AlarmStore.get(this, id)!!
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, AlarmStore.CHANNEL) else Notification.Builder(this)
        b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(j.getString("title"))
            .setContentText(if (muted) "Muted • Snooze or dismiss your reminder" else "Task reminder • Slide to snooze or dismiss")
            .setCategory(Notification.CATEGORY_ALARM).setPriority(Notification.PRIORITY_MAX)
            .setVisibility(Notification.VISIBILITY_PUBLIC).setOngoing(true)
            .setContentIntent(AlarmStore.screen(this, id))
            .addAction(Notification.Action.Builder(null, "Snooze", action(id, "snoozed")).build())
            .addAction(Notification.Action.Builder(null, "Dismiss", action(id, "dismissed")).build())
        if (fullScreen) b.setFullScreenIntent(AlarmStore.screen(this, id), true)
        else b.setOnlyAlertOnce(true)
        return b.build()
    }
    private fun activate() {
        stopAudio()
        muted = false
        val n = notification(true)
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIFICATION, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        else startForeground(NOTIFICATION, n)
        handler.removeCallbacks(timeout)
        handler.postDelayed(timeout, AlarmStore.TIMEOUT)
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = (getSystemService(POWER_SERVICE) as PowerManager)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "$packageName:alarm").apply { acquire(AlarmStore.TIMEOUT + 10000) }
        if (AlarmStore.prefs(this).getBoolean("sound", true)) play() else muted = true
        AlarmStore.changed(this)
    }
    private fun play() {
        val audio = getSystemService(AUDIO_SERVICE) as AudioManager
        val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
        val granted = if (Build.VERSION.SDK_INT >= 26) {
            focus = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(attrs).setOnAudioFocusChangeListener(focusListener).build()
            audio.requestAudioFocus(focus!!)
        } else audio.requestAudioFocus(focusListener, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
        if (granted != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) { muted = true; return }
        try {
            player = MediaPlayer().apply {
                setAudioAttributes(attrs)
                val raw = resources.getIdentifier("alarm", "raw", packageName)
                if (raw != 0) resources.openRawResourceFd(raw).use { setDataSource(it.fileDescriptor, it.startOffset, it.length) }
                else setDataSource(this@AlarmService, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM))
                isLooping = true
                prepare()
                start()
            }
        } catch (_: Exception) { mute() }
    }
    private fun stopAudio() {
        player?.release(); player = null
        val audio = getSystemService(AUDIO_SERVICE) as AudioManager
        if (Build.VERSION.SDK_INT >= 26) focus?.let { audio.abandonAudioFocusRequest(it) }
        else audio.abandonAudioFocus(focusListener)
        focus = null
    }
    fun mute() {
        muted = true
        stopAudio()
        if (current != null && AlarmStore.get(this, current!!) != null)
            getSystemService(NotificationManager::class.java).notify(NOTIFICATION, notification(false))
        AlarmStore.changed(this)
    }
    fun remove(id: Int) {
        val wasCurrent = current == id
        queue.remove(id)
        if (!wasCurrent) return
        stopAudio()
        handler.removeCallbacks(timeout)
        if (queue.isEmpty()) {
            stopForeground(true)
            stopSelf()
        } else activate()
        AlarmStore.changed(this)
    }
    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        stopAudio()
        wakeLock?.let { if (it.isHeld) it.release() }
        unregisterReceiver(screenReceiver)
        running = null
        super.onDestroy()
    }
}
