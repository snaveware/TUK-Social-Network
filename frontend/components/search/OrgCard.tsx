import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { Chat, ChatTypes } from "../chats/ChatCard";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import Avatar from "../Avatar";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
import { useRouter } from "expo-router";
import Config from "../../Config";
import { PostOwner } from "../posts/PostCard";
import socket from "../../Socket";
import { AntDesign } from "@expo/vector-icons";

export default function OrgCard({
  item,
  checked = false,
  onToggleCheck,
  mode,
}: {
  item: any;
  checked: boolean;
  onToggleCheck: any;
  mode: "search" | "select";
}) {
  const { theme } = useContext(AppThemeContext);

  const { user: authUser, accessToken } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={() => {
        onToggleCheck(item);
      }}
      style={[
        styles.flexRow,
        {
          //   paddingHorizontal: 10,
          paddingVertical: 5,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 5,
            justifyContent: "flex-start",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ paddingLeft: 10 }}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              lineHeight: 20,
              paddingHorizontal: 10,
              textAlign: "left",
              width: mode == "select" ? "65%" : "70%",
            }}
          >
            {`[${item.abbreviation}] `} {item.name}{" "}
          </Text>
        </View>
      </View>

      {mode === "select" && (
        <View
          style={[
            styles.flexRow,
            styles.flexCenter,
            {
              width: 25,
              height: 25,
              borderWidth: 1,
              borderRadius: 5,
              marginRight: 10,
              borderColor: checked ? theme.accent : theme.border,
            },
          ]}
        >
          {checked && <AntDesign name="check" size={16} color={theme.accent} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
