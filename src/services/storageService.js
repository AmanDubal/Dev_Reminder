import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@dev_reminder_tasks';

export const saveTasks = async (tasks) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const loadTasks = async () => {
  const rawTasks = await AsyncStorage.getItem(STORAGE_KEY);
  return rawTasks ? JSON.parse(rawTasks) : [];
};
