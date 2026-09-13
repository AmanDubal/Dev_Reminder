export const createTask = ({title, date, time}) => ({
  id: String(Date.now() + Math.random()),
  title: title.trim(),
  date,
  time,
  status: 'scheduled',
  reminderEnabled: true,
});

export const toggleTaskStatus = (task) => ({
  ...task,
  status: task.status === 'completed' ? 'scheduled' : 'completed',
});
