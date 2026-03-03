// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false,headerBackTitle:"MyHome" }} />
      <Stack.Screen name="features" options={{ headerShown: false }} />
    </Stack>
  );
}