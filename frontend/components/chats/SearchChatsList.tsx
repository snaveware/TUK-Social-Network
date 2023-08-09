import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { Chat } from "./ChatCard";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import SearchChatCard from "./SearchChatCard";

export default function SearchChatsList({ chats }: { chats?: Chat[] }) {
  return (
    <View style={{ flex: 1 }}>
      {chats?.map((chat, index) => {
        return <SearchChatCard key={index} chat={chat} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
