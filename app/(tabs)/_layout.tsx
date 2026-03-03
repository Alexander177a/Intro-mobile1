// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" 
          options={{ 
            title: "PLAY PADEL", 
            headerTitleStyle:{fontSize:40},
            headerStyle:{ height:150},
            headerTitleAlign:'left'
            }} />
      
      
      
      <Tabs.Screen name="about" options={{ title: "Community" ,headerStatusBarHeight:100 }} />
    </Tabs>
  );
}
