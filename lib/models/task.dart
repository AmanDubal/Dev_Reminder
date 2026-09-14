class Task {
  final String id;
  final String title;
  final String date; // YYYY-MM-DD
  final String time; // HH:mm (24-hour, stored)
  final String status; // scheduled, snoozed, completed, deleted
  final bool reminderEnabled;
  final int snoozeDuration; // minutes
  final int notificationId;
  final String createdAt;
  final String updatedAt;

  Task({
    required this.id,
    required this.title,
    required this.date,
    required this.time,
    this.status = 'scheduled',
    this.reminderEnabled = true,
    this.snoozeDuration = 10,
    required this.notificationId,
    required this.createdAt,
    required this.updatedAt,
  });

  Task copyWith({
    String? id,
    String? title,
    String? date,
    String? time,
    String? status,
    bool? reminderEnabled,
    int? snoozeDuration,
    int? notificationId,
    String? createdAt,
    String? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      date: date ?? this.date,
      time: time ?? this.time,
      status: status ?? this.status,
      reminderEnabled: reminderEnabled ?? this.reminderEnabled,
      snoozeDuration: snoozeDuration ?? this.snoozeDuration,
      notificationId: notificationId ?? this.notificationId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'date': date,
      'time': time,
      'status': status,
      'reminderEnabled': reminderEnabled ? 1 : 0,
      'snoozeDuration': snoozeDuration,
      'notificationId': notificationId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'] as String,
      title: map['title'] as String,
      date: map['date'] as String,
      time: map['time'] as String,
      status: map['status'] as String,
      reminderEnabled: (map['reminderEnabled'] as int) == 1,
      snoozeDuration: map['snoozeDuration'] as int,
      notificationId: map['notificationId'] as int,
      createdAt: map['createdAt'] as String,
      updatedAt: map['updatedAt'] as String,
    );
  }
}