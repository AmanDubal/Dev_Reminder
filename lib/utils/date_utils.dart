import 'package:intl/intl.dart';

class AppDateUtils {
  static String formatDateKey(DateTime date) => DateFormat('yyyy-MM-dd').format(date);

  static String formatTime12h(String time24) {
    final parts = time24.split(':');
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final period = hour >= 12 ? 'PM' : 'AM';
    final hour12 = hour % 12 == 0 ? 12 : hour % 12;
    return '$hour12:${minute.toString().padLeft(2, '0')} $period';
  }
}