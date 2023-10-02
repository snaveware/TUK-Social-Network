import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { Chat } from "./ChatCard";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import SearchChatCard from "./SearchChatCard";
import socket from "../../Socket";

export default function SearchChatsList({
  chats,
  resolveOrigin = "chat_search",
}: {
  chats?: Chat[];
  resolveOrigin?: string;
}) {
  const onChatSelect = (chat: Chat) => {
    socket.emit("resolve_chat", {
      chatId: chat?.id,
      origin: resolveOrigin,
    });
  };
  return (
    <View style={{ flex: 1 }}>
      {chats?.map((chat, index) => {
        return (
          <SearchChatCard onSelect={onChatSelect} key={index} chat={chat} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
