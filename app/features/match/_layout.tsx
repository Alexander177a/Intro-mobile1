import { Stack } from 'expo-router';

export default function MatchLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Match aanmaken', headerShadowVisible: false }} />
      <Stack.Screen name="chat" options={{ headerShadowVisible: false }} />
    </Stack>
  );
}