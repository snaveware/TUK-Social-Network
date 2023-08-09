import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { Chat, ChatTypes } from "./ChatCard";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import Avatar from "../Avatar";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
import { useRouter } from "expo-router";
import Config from "../../Config";
import { PostOwner } from "../posts/PostCard";
import socket from "../../Socket";

export default function SearchUserCard({
  user,
  onSelect,
}: {
  user?: PostOwner;
  onSelect: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={() => {
        onSelect(user);
      }}
      style={[
        styles.flexRow,
        {
          flex: 1,

          paddingHorizontal: 10,
          paddingVertical: 5,
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
