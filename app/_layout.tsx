import { Stack, Tabs } from "expo-router";

const RootLayout = () => {
  return (
    <Tabs>
    <Tabs.Screen name="index"
      options={{
        title:"MyHome",
        tabBarLabel:"MyHome"
      }}></Tabs.Screen>

    <Tabs.Screen name="about"
      options={{
        title: "Community"
      }}></Tabs.Screen>

      <Tabs.Screen name="features/locations"
        options={{href:null,}}
      ></Tabs.Screen>

    </Tabs>
  );

}

export default RootLayout;