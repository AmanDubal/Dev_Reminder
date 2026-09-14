import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dev_reminder/widgets/empty_state.dart';
import 'package:dev_reminder/widgets/task_tile.dart';
import 'package:dev_reminder/models/task.dart';

void main() {
  testWidgets('EmptyState shows expected message', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: EmptyState())));
    expect(find.text('No tasks scheduled for today.'), findsOneWidget);
    expect(find.text('Plan your day and stay productive.'), findsOneWidget);
  });

  testWidgets('TaskTile displays title and formatted time', (WidgetTester tester) async {
    final task = Task(
      id: '1',
      title: 'Test Task',
      date: '2026-01-01',
      time: '14:30',
      notificationId: 1,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: TaskTile(
          task: task,
          onTap: () {},
          onDelete: () {},
          onToggleComplete: () {},
        ),
      ),
    ));

    expect(find.text('Test Task'), findsOneWidget);
    expect(find.text('2:30 PM'), findsOneWidget);
  });
}