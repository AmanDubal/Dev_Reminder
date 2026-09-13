import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TaskEditorScreen from '../screens/TaskEditorScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Dev Reminder', headerShown: false}}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{title: 'Calendar'}}
      />
      <Stack.Screen
        name="TaskEditor"
        component={TaskEditorScreen}
        options={({route}) => ({
          title: route.params?.task ? 'Edit Task' : 'New Task',
        })}
      />
    </Stack.Navigator>
  );
}
