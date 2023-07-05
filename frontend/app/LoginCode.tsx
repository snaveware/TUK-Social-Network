import { StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";

import { useEffect } from "react";
import { Pressable } from "react-native";
import { Link } from "expo-router";

export default function LoginCodeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Code</Text>
      <Link href={"/"} style={{ color: "blue" }}>
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
    height: 1,
    width: "80%",
  },
});
