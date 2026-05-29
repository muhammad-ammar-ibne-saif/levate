import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tabs: {
  name: string;
  title: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { name: "home", title: "Home", icon: "home-outline", activeIcon: "home" },
  {
    name: "goals",
    title: "Goals",
    icon: "radio-button-off-outline",
    activeIcon: "radio-button-on",
  },
  {
    name: "community",
    title: "Community",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    name: "notifications",
    title: "Alerts",
    icon: "notifications-outline",
    activeIcon: "notifications",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
  {
    name: "progress",
    title: "Progress",
    icon: "bar-chart-outline",
    activeIcon: "bar-chart",
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#161616",
          borderTopColor: "rgba(255,255,255,0.07)",
          borderTopWidth: 0.5,
          height: 88,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#7ED957",
        tabBarInactiveTintColor: "#3A3A3A",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
