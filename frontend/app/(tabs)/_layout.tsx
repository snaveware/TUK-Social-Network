import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
// import ChatsIcon from "../../assets/images/ChatsIcon.svg";
import ChatsIcon from "../../components/custom-icons/ChatsIcon";
import { Text, View } from "../../components/Themed";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import { Image } from "react-native";
const Favicon = require("../../assets/images/favicon.png");
import Colors from "../../constants/Colors";
import { useContext } from "react";

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
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <View style={[styles.flexRow, { backgroundColor: "transparent" }]}>
              <Link href="Notifications" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="bell"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
              <Link href="posts/Search" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <MaterialIcons
                      name="search"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{
                        marginHorizontal: 15,
                        fontWeight: "bold",
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>

              <Link href="/posts/New" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="plus"
                      size={22}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
          headerLeft: () => {
            return (
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent", marginLeft: 15 },
                ]}
              >
                <Image source={Favicon} style={{ width: 36, height: 36 }} />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="ChatsTab"
        options={{
          title: "Chats",

          tabBarIcon: ({ color }) => (
            // <TabBarIcon name="comment" color={color} />
            // <ChatsIcon color={color} />
            <MaterialIcons name="forum" color={color} size={25} />
          ),
          headerRight: () => (
            <View style={[styles.flexRow, { backgroundColor: "transparent" }]}>
              <Link href="/Notifications" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="bell"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
              <Link href="chats/Search" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <MaterialIcons
                      name="search"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{
                        marginHorizontal: 15,
                        fontWeight: "bold",
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>

              <Link href="chats/New" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="plus"
                      size={22}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
          headerLeft: () => {
            return (
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent", marginLeft: 15 },
                ]}
              >
                <Image source={Favicon} style={{ width: 36, height: 36 }} />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="FilesTab"
        options={{
          title: "Files",
          tabBarLabel: "Files",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="file-copy" color={color} size={25} />;
          },
        }}
      />
      <Tabs.Screen
        name="AccountTab"
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-circle" color={color} size={25} />
          ),
          headerRight: () => (
            <View style={[styles.flexRow, { backgroundColor: "transparent" }]}>
              <Link href="Notifications" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="bell"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
              <Link href="posts/Search" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <MaterialIcons
                      name="search"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{
                        marginHorizontal: 15,
                        fontWeight: "bold",
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
          headerLeft: () => {
            return (
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent", marginLeft: 15 },
                ]}
              >
                <Image source={Favicon} style={{ width: 36, height: 36 }} />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="SettingsTab"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" color={color} size={25} />
          ),
          headerRight: () => (
            <View style={[styles.flexRow, { backgroundColor: "transparent" }]}>
              <Link href="/Notifications" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="bell"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
          headerLeft: () => {
            return (
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent", marginLeft: 15 },
                ]}
              >
                <Image source={Favicon} style={{ width: 36, height: 36 }} />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
