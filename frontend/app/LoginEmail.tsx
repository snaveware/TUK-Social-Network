import { StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { Pressable } from "react-native";

import { useEffect } from "react";
import { Link } from "expo-router";

export default function LoginEmailScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Email</Text>
      <Link href={"/LoginCode"} style={{ color: "blue" }}>
        Continue
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
  },
});
