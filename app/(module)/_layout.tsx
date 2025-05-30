import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="course-details" />
      <Stack.Screen 
        name="content-viewer" 
        options={{ 
          presentation: 'card',
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="video-player" 
        options={{ 
          presentation: 'card',
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="resources" 
        options={{ 
          presentation: 'card',
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="case-study" 
        options={{ 
          presentation: 'card',
          gestureEnabled: true 
        }} 
      />
    </Stack>
  );
}