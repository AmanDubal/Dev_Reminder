export const formatDisplayDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export const dateKeyFromDate = (date) => new Date(date).toISOString().slice(0, 10);

export const toDateFromTask = (dateString, timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const next = new Date(dateString);
  next.setHours(hours, minutes, 0, 0);
  return next;
};
