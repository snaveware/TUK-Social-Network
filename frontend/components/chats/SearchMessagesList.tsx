import { View, Text } from "../Themed";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import SearchMessageCard from "./SearchMessageCard";
import { Message } from "../../app/chats/[chatId]";

export default function SearchMessagesList({
  messages,
}: {
  messages?: Message[];
}) {
  return (
    <View style={{ flex: 1 }}>
      {messages?.map((message, index) => {
        return <SearchMessageCard key={index} message={message} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
