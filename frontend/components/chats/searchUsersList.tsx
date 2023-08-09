import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { PostOwner } from "../posts/PostCard";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import SearchUserCard from "./searchUserCard";

export default function SearchusersList({
  users,
  onSelect,
}: {
  users?: PostOwner[];
  onSelect: any;
}) {
  return (
    <View style={{ flex: 1 }}>
      {users?.map((user, index) => {
        return <SearchUserCard key={index} user={user} onSelect={onSelect} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
