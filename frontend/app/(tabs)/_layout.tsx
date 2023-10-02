import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme, Platform } from "react-native";
// import ChatsIcon from "../../assets/images/ChatsIcon.svg";
import ChatsIcon from "../../components/custom-icons/ChatsIcon";
import { Text, View } from "../../components/Themed";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import { Image } from "react-native";
const Favicon = require("../../assets/images/favicon.png");
import Colors from "../../constants/Colors";
import { useContext } from "react";
import { Entypo } from "@expo/vector-icons";
import { AppThemeContext } from "../../Theme";

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
  const { theme } = useContext(AppThemeContext);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Posts",
          headerTitleAlign: "center",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          // headerRight: () => (
          //   <View style={[styles.flexRow, { justifyContent: "space-between",alignItems: "center"}]}>
          //     {/* <View
          //       style={[
          //         styles.flexRow,
          //         styles.flexCenter,
          //         { backgroundColor: "transparent", marginLeft: 15 },
          //       ]}
          //     >
          //       <Image source={Favicon} style={{ width: 36, height: 36 }} />
          //     </View> */}

          //     <View>

          //     <Link href="Notifications" asChild>
          //       <Pressable>
          //         {({ pressed }) => (
          //           <FontAwesome
          //             name="bell"
          //             size={28}
          //             color={Colors[colorScheme ?? "light"].text}
          //             style={{ opacity: pressed ? 0.5 : 1 }}
          //           />
          //         )}
          //       </Pressable>
          //     </Link>
          //     <Link href="posts/Search" asChild>
          //       <Pressable>
          //         {({ pressed }) => (
          //           <MaterialIcons
          //             name="search"
          //             size={32}
          //             color={Colors[colorScheme ?? "light"].text}
          //             style={{
          //               marginHorizontal: 15,
          //               fontWeight: "bold",
          //               opacity: pressed ? 0.5 : 1,
          //             }}
          //           />
          //         )}
          //       </Pressable>
          //     </Link>

          //     <Link href="/posts/New" asChild>
          //       <Pressable>
          //         {({ pressed }) => (
          //           <FontAwesome
          //             name="plus"
          //             size={30}
          //             color={Colors[colorScheme ?? "light"].text}
          //             style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //           />
          //         )}
          //       </Pressable>
          //     </Link>
          //     </View>
          //   </View>
          // ),
          // headerLeft: () => {
          //   return (
          //     <View
          //       style={[
          //         styles.flexRow,
          //         styles.flexCenter,
          //         { backgroundColor: "transparent", marginLeft: 15 },
          //       ]}
          //     >
          //       <Image source={Favicon} style={{ width: 36, height: 36 }} />
          //     </View>
          //   );
          // },
        }}
      />

      <Tabs.Screen
        name="SearchTab"
        options={{
          title: "Account",
          tabBarLabel: "Search",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ChatsTab"
        options={{
          title: "TUchat",
          tabBarLabel: "Chats",
          headerTitleAlign: "left",
          headerShown: Platform.select({ ios: true, android: true })
            ? true
            : false,
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
                    <MaterialIcons
                      name="notifications-none"
                      size={35}
                      color={theme.accent}
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
                      size={35}
                      color={theme.accent}
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
                    <MaterialIcons
                      name="add-comment"
                      size={30}
                      color={theme.accent}
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
          title: "Drive",
          headerShown: false,
          tabBarLabel: "Drive",
          tabBarIcon: ({ color }) => {
            return <Entypo name="google-drive" size={25} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="AccountTab"
        options={{
          title: "Account",
          tabBarLabel: "Account",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-circle" color={color} size={25} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
