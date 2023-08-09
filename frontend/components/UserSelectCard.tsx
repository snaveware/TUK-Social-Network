import { View, Text } from "./Themed";
import { useEffect, useState, useContext } from "react";
import { Chat, ChatTypes } from "./chats/ChatCard";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import GlobalStyles from "../GlobalStyles";
import Avatar from "./Avatar";
import { AppThemeContext } from "../Theme";
import { AuthContext } from "../app/_layout";
import { useRouter } from "expo-router";
import Config from "../Config";
import { PostOwner } from "./posts/PostCard";
import socket from "../Socket";
import { AntDesign } from "@expo/vector-icons";

export default function UserSelectCard({
  user,
  checked = false,
  onToggleCheck,
}: {
  user?: PostOwner;
  checked: boolean;
  onToggleCheck: any;
}) {
  const { theme } = useContext(AppThemeContext);

  const { user: authUser, accessToken } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={() => {
        onToggleCheck(user);
      }}
      style={[
        styles.flexRow,
        {
          paddingHorizontal: 10,
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
        <Avatar
          text={`${user?.firstName?.[0]} ${user?.firstName?.[1]}`}
          imageSource={
            user?.profileAvatarId
              ? `${Config.API_URL}/files?fid=${user?.profileAvatarId}&t=${accessToken}`
              : ""
          }
          style={{ width: 50, height: 50 }}
          textStyles={{ fontSize: 12 }}
        />
        <View style={{ paddingLeft: 10 }}>
          <Text>{`${
            user?.staffProfileIfStaff ? user?.staffProfileIfStaff.title : ""
          } ${user?.firstName} ${user?.lastName}`}</Text>
          {user?.bio && (
            <Text style={{ color: theme.foregroundMuted }}>
              {user?.bio.length > 50 ? user.bio.substring(0, 50) : user.bio}
            </Text>
          )}
        </View>
      </View>

      <View
        style={[
          styles.flexRow,
          styles.flexCenter,
          {
            width: 25,
            height: 25,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: checked ? theme.accent : theme.border,
          },
        ]}
      >
        {checked && <AntDesign name="check" size={16} color={theme.accent} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
