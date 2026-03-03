import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Parse from 'parse/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Back4app 
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize("160SSoIfPYLcDTSjxD0aQ9y192XZCjKJu72OhoFX", "LbjXtAWE6s1w2z4SJ5dklH5fJHNzF8pzXxEBBoI5") // appID and JS key
Parse.serverURL = 'https://parseapi.back4app.com/';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="weather" />
        <Stack.Screen name="results" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}
