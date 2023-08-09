import React from "react";
import { View, Text, TextInput } from "./Themed";
import { useEffect, useState, useContext } from "react";
import { PostOwner } from "./posts/PostCard";
import { StyleSheet } from "react-native";
import GlobalStyles from "../GlobalStyles";
import SearchUserCard from "./chats/searchUserCard";
import UserSelectCard from "./UserSelectCard";
import socket from "../Socket";
import { AuthContext } from "../app/_layout";
import { AppThemeContext } from "../Theme";

export default function MultiUserSelector({
  onSelectChange,
}: {
  onSelectChange: any;
}) {
  const [selected, setSelected] = useState<any>({});
  const [users, setUsers] = useState<PostOwner[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(AppThemeContext);

  function onToggleCheck(user: PostOwner) {
    setSelected((prevValues: any) => {
      const newValues = {
        ...prevValues,
      };

      if (newValues[user.id]) {
        delete newValues[user.id];
      } else {
        newValues[user.id] = true;
      }
      return newValues;
    });
  }

  useEffect(() => {
    socket.on("search_users_results", (data) => {
      console.log("---search users results--- ", data.users?.length);
      setUsers(data.users);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // console.log("selected changed: ", selected);
    onSelectChange(selected);
  }, [selected]);

  useEffect(() => {
    socket.emit("search_users", { searchString });
  }, [searchString]);

  return (
    <View
      style={[
        styles.flexCols,
        { justifyContent: "flex-start", alignItems: "flex-start", flex: 1 },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          {
            justifyContent: "center",
            borderTopWidth: 0.3,
            alignItems: "center",
            borderTopColor: theme.border,
            paddingHorizontal: 15,
            paddingVertical: 5,
          },
        ]}
      >
        <TextInput
          style={[
            {
              marginHorizontal: 5,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 15,
              borderWidth: 1,
              backgroundColor: theme.background,
              flex: 1,
            },
          ]}
          value={searchString}
          onChangeText={(value) => {
            // console.log("new search string: ", value);
            setSearchString(value);
          }}
          placeholder={"search User"}
          textContentType="name"
        />
      </View>

      {users?.map((user, index) => {
        return (
          <UserSelectCard
            onToggleCheck={onToggleCheck}
            checked={selected[user.id] ? true : false}
            key={index}
            user={user}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
