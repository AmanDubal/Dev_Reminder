import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/task.dart';

class DatabaseHelper {
  DatabaseHelper._();
  static final DatabaseHelper instance = DatabaseHelper._();
  static Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'dev_reminder.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL,
            reminderEnabled INTEGER NOT NULL,
            snoozeDuration INTEGER NOT NULL,
            notificationId INTEGER NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          )
        ''');
      },
    );
  }

  Future<void> insertTask(Task task) async {
    final db = await database;
    await db.insert('tasks', task.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateTask(Task task) async {
    final db = await database;
    await db.update('tasks', task.toMap(), where: 'id = ?', whereArgs: [task.id]);
  }

  Future<void> deleteTask(String id) async {
    final db = await database;
    await db.delete('tasks', where: 'id = ?', whereArgs: [id]);
  }

  Future<List<Task>> getTasksForDate(String date) async {
    final db = await database;
    final result = await db.query(
      'tasks',
      where: 'date = ? AND status != ?',
      whereArgs: [date, 'deleted'],
      orderBy: 'time ASC',
    );
    return result.map((e) => Task.fromMap(e)).toList();
  }

  Future<Task?> getTaskById(String id) async {
    final db = await database;
    final result = await db.query('tasks', where: 'id = ?', whereArgs: [id]);
    if (result.isEmpty) return null;
    return Task.fromMap(result.first);
  }

  Future<Set<String>> getDatesWithTasks() async {
    final db = await database;
    final result = await db.rawQuery(
      "SELECT DISTINCT date FROM tasks WHERE status != 'deleted'",
    );
    return result.map((e) => e['date'] as String).toSet();
  }
}