import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
// import ChatsIcon from "../../assets/images/ChatsIcon.svg";
import ChatsIcon from "../../components/custom-icons/ChatsIcon";

import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Posts",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="Chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            // <TabBarIcon name="comment" color={color} />
            // <ChatsIcon color={color} />
            <MaterialIcons name="forum" color={color} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="Files"
        options={{
          title: "Files",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="file-copy" color={color} size={25} />;
          },
        }}
      />
      <Tabs.Screen
        name="Account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-circle" color={color} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" color={color} size={25} />
          ),
        }}
      />
    </Tabs>
  );
}
