import { View, Text, TextInput } from "../../components/Themed";
import { TouchableOpacity, Platform, StyleSheet, Image } from "react-native";
import { useEffect, useContext, useState } from "react";
import GlobalStyles from "../../GlobalStyles";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { AuthContext, User } from "../../app/_layout";
const Favicon = require("../../assets/images/favicon.png");
import Avatar from "../../components/Avatar";
import { FullChart } from "../../app/chats/[chatId]";
import socket from "../../Socket";

import Config from "../../Config";
import { ChatMember, ChatTypes } from "../../components/chats/ChatCard";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Button from "../../components/Button";
import Modal, { ModalVariant } from "../../components/Modal";
import MultiUserSelector from "../../components/MultiUserSelector";
import Utils, { BodyRequestMethods } from "../../Utils";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import uploadFile, { extractAsset } from "../../uploadFile";
import Popover from "../../components/Popover";
export type chatUpdate = {
  name?: string;
  description?: string;
  profileAvatarId?: number;
  members?: number[];
  admins?: number[];
};

export default function ChatInfo({
  chat,
  onUpdate,
}: {
  chat: FullChart;
  onUpdate: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const router = useRouter();
  const [errors, setErrors] = useState<any>({});
  const [chatUpdate, setChatUpdate] = useState<chatUpdate>({});
  const [editMode, setEditMode] = useState<boolean>(false);
  const [addUsers, setAddUsers] = useState<boolean>(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const [confirmationModalText, setConfirmationModalText] = useState<string>(
    "Are you sure you want to exit this group?"
  );
  const [confirmationModalVariant, setConfirmationModalVariant] =
    useState<ModalVariant>(ModalVariant.confirmation);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>(chat.name);
  const [description, setDescription] = useState<string>(chat.description);

  const [members, setMembers] = useState<string[]>();
  const [profileAvatarImageSource, setProfileAvatarImageSource] =
    useState<string>();

  const [activeMember, setActiveMember] = useState<ChatMember>();

  function onSelectionChange(selection: any) {
    setMembers(Object.keys(selection));
  }

  console.log("chat admins: ", chat?.admins?.[0]);

  useEffect(() => {
    socket.on("resolve_chat_response", (data) => {
      console.log("resolve chat response: ", data);

      if (Platform.select({ ios: true, android: true })) {
        router.back();
        router.push(`/chats/${data.chat.id}`);
      } else {
        router.push({
          pathname: `/(tabs)/ChatsTab`,
          params: { chatId: data.chat.id },
        });
      }
      // setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (chat) {
      setProfileAvatarImageSource(
        chat?.profileAvatarId && accessToken
          ? `${Config.API_URL}/files?fid=${chat?.profileAvatarId}&t=${accessToken}`
          : undefined
      );
    }
  }, [chat]);

  async function onSave() {
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          name: name,
          description: description,
        },
      });

      console.log("group update results", results.data);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error saving group chat chat: ", error);
    }
  }

  async function updateAvatar(profileAvatarId: number) {
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          profileAvatarId: profileAvatarId,
        },
      });

      console.log("group update results", results.data);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error saving group chat chat: ", error);
    }
  }

  async function onRemoveMember(user: ChatMember | User) {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results: any = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          removeMembers: [user?.id],
        },
      });

      console.log("remove user results", results);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error removing member from chat: ", error);
    }
  }

  async function onExitGroup() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results: any = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          removeMembers: [authUser?.id],
        },
      });

      console.log("exit group results", results);

      if (results.success) {
        onUpdate();
        router.back();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error exiting chat: ", error);
    }
  }

  async function onMakeMemberAdmin(user: ChatMember | User) {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          addAdmins: [user?.id],
        },
      });

      console.log("add admin results", results.data);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error adding admin to chat: ", error);
    }
  }

  async function onRevokeAdmin(user: ChatMember | User) {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          removeAdmins: [user?.id],
        },
      });

      console.log("add admin results", results.data);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error adding admin to chat: ", error);
    }
  }

  function onModalConfirm() {
    onExitGroup();
  }

  async function onAddMembers() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${chat.id}`;

      if (!members || members.length < 1) {
        setLoading(false);
        return;
      }

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          addMembers: members,
        },
      });

      console.log("add members results", results.data);

      if (results.success) {
        onUpdate();
      } else {
        setConfirmationModalText(results.message);
        setConfirmationModalVariant(ModalVariant.danger);
        setShowConfirmationModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error adding members to chat: ", error);
    }
  }

  async function pickImage() {
    if (Platform.OS == "web") {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
      });

      const asset: any = extractAsset(result);

      const attr = Utils.extractMimeTypeAndBase64(asset.uri);
      asset.mimeType = attr.mimeType;

      setProfileAvatarImageSource(asset.uri);

      const uploaded = await uploadFile(asset);

      if (uploaded) {
        /**
         * update profile
         */

        updateAvatar(uploaded.id);
      }
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result && result.assets) {
      const asset: any = {
        uri: result.assets[0].uri,
        type: result.assets[0].type || "image",
      };

      asset.mimeType = Utils.getMimeTypeFromURI({
        uri: asset.uri,
        type: asset.type || "image",
      });

      asset.name = `${Utils.generateUniqueString()}${Utils.getMediaFileExtension(
        asset.mimeType
      )}`;

      console.log("picked asset: ", asset);

      setProfileAvatarImageSource(asset.uri);

      const uploaded = await uploadFile(asset);

      if (uploaded) {
        /**
         * update profile
         */

        updateAvatar(uploaded.id);
      }
    }
  }

  function isAdmin(user: ChatMember | User) {
    if (chat?.admins && chat?.admins?.length > 0) {
      for (let index = 0; index < chat?.admins?.length; index++) {
        if (user?.id === chat?.admins?.[index].id) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.margin, { flex: 1, position: "relative" }]}
      showsVerticalScrollIndicator={false}
    >
      <Modal
        showModal={showConfirmationModal}
        setShowModal={setShowConfirmationModal}
        variant={confirmationModalVariant}
        message={confirmationModalText}
        onConfirm={onModalConfirm}
      />

      <View
        style={[
          styles.flexCols,
          styles.padding,
          styles.flexCenter,

          { backgroundColor: theme.backgroundMuted, borderRadius: 3 },
        ]}
      >
        {/* <Avatar
          style={{ height: 100, width: 100, marginBottom: 10 }}
          textStyles={{ fontSize: 13 }}
          text={`${chat.name[0]} ${chat.name[1]}`}
        /> */}
        <View
          style={[
            {
              width: 110,
              height: 110,
              borderRadius: 9999,
            },
          ]}
        >
          <Avatar
            text={`${chat.name[0]} ${chat.name[1]}`}
            imageSource={profileAvatarImageSource}
            style={[
              {
                width: 110,
                height: 110,
                backgroundColor: theme.background,
              },
            ]}
            textStyles={{ fontSize: 30 }}
          />
          <TouchableOpacity
            style={[
              styles.flexRow,
              styles.flexCenter,
              {
                position: "absolute",
                backgroundColor: theme.backgroundMuted,
                width: 36,
                height: 36,
                borderRadius: 9999,
                bottom: 0,
                right: 0,
                zIndex: 10,
              },
            ]}
            onPress={() => {
              pickImage();
            }}
          >
            <Entypo name="camera" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {!editMode && (
          <>
            <Text style={{ fontWeight: "500", marginVertical: 5 }}>
              {chat.name}
            </Text>
            <Text
              style={{
                fontWeight: "500",
                marginVertical: 5,
                color: theme.foregroundMuted,
              }}
            >
              {chat.description}
            </Text>
          </>
        )}

        {editMode && (
          <>
            <View style={[styles.padding, styles.flexCols, { width: "100%" }]}>
              <Text style={[styles.padding, { color: theme.accent }]}>
                Group Name
              </Text>
              <TextInput
                style={[
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 5,
                    borderWidth: 1,
                    backgroundColor: theme.background,
                  },
                ]}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                }}
                placeholder={"What do you want to call the group?"}
              />
            </View>
            <View style={[styles.padding, styles.flexCols, { width: "100%" }]}>
              <Text style={[styles.padding, { color: theme.accent }]}>
                Description
              </Text>
              <TextInput
                style={[
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 5,
                    borderWidth: 1,
                    backgroundColor: theme.background,

                    minHeight: 60,
                  },
                ]}
                multiline={true}
                value={description}
                onChangeText={(value) => {
                  // console.log("new search string: ", value);
                  setDescription(value);
                }}
                placeholder={"what's the group chat about?"}
              />
            </View>
          </>
        )}
        {chat.chatType === ChatTypes.group && isAdmin(authUser) && (
          <View
            style={{
              backgroundColor: "transparent",
              position: "absolute",
              top: 10,
              right: 10,
            }}
          >
            {!editMode && (
              <MaterialCommunityIcons
                name="square-edit-outline"
                onPress={() => {
                  setEditMode(true);
                }}
                size={24}
                color={theme.primary}
              />
            )}
            {editMode && (
              <Button
                text="Save"
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginBottom: 5,
                }}
                onPress={() => {
                  setEditMode(false);
                  onSave();
                }}
              />
            )}
            {editMode && (
              <Button
                text="Cancel"
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: theme.destructive,
                }}
                onPress={() => {
                  setEditMode(false);
                }}
              />
            )}
          </View>
        )}
      </View>
      {chat.chatType === ChatTypes.group && (
        <>
          {!addUsers && isAdmin(authUser) && (
            <TouchableOpacity
              onPress={() => setAddUsers(true)}
              style={[
                styles.flexRow,
                styles.padding,
                styles.marginV,
                { backgroundColor: theme.backgroundMuted, borderRadius: 3 },
              ]}
            >
              <MaterialIcons
                name="group-add"
                size={24}
                color={theme.foreground}
              />
              <Text
                style={{
                  marginLeft: 10,
                  color: theme.foreground,
                  fontSize: 16,
                }}
              >
                Add Members
              </Text>
            </TouchableOpacity>
          )}
          <View style={[styles.flexRow, styles.flexCenter]}>
            {addUsers && (
              <Button
                onPress={() => {
                  setAddUsers(false);
                  onAddMembers();
                }}
                text="Save"
                style={{ marginTop: 10, marginRight: 10 }}
              />
            )}
            {addUsers && (
              <Button
                onPress={() => {
                  setAddUsers(false);
                }}
                text="Cancel"
                style={{ marginTop: 10, backgroundColor: theme.destructive }}
              />
            )}
          </View>

          {addUsers && <MultiUserSelector onSelectChange={onSelectionChange} />}
        </>
      )}

      {chat.chatType === ChatTypes.group && (
        <TouchableOpacity
          style={[
            styles.flexRow,
            styles.padding,
            styles.marginV,
            { backgroundColor: theme.destructive, borderRadius: 3 },
          ]}
          onPress={() => {
            if (isAdmin(authUser) && chat?.admins?.length === 1) {
              setConfirmationModalText(
                "You are the only admin in this group please recruite another admin before you can leave"
              );
              setConfirmationModalVariant(ModalVariant.danger);
            } else {
              setConfirmationModalVariant(ModalVariant.confirmation);
              setConfirmationModalText(
                "Are you sure you want to exit this group?"
              );
            }
            setShowConfirmationModal(true);
          }}
        >
          <MaterialCommunityIcons
            name="exit-run"
            size={24}
            color={theme.primaryForeground}
          />
          <Text
            style={{
              marginLeft: 10,
              color: theme.primaryForeground,
              fontSize: 16,
            }}
          >
            Exit Group
          </Text>
        </TouchableOpacity>
      )}
      {!addUsers && chat.members && chat.members.length > 0 && (
        <View style={[styles.padding, { paddingLeft: 20 }]}>
          <Text style={{ color: theme.foregroundMuted }}>
            {chat.members.length} Members{" "}
          </Text>
        </View>
      )}
      {!addUsers &&
        chat.members?.map((user, index) => {
          return (
            <View
              key={index}
              style={[
                styles.flexRow,
                { justifyContent: "space-between", alignItems: "center" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  if (user.id !== authUser?.id) {
                    if (isPopoverOpen) {
                      setIsPopoverOpen(false);
                      return;
                    }
                    socket.emit("resolve_chat", { otherUserId: user?.id });
                  }
                }}
                style={[
                  styles.flexRow,
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "75%",
                  },
                ]}
              >
                <Avatar
                  text={`${user?.firstName?.[0]} ${user?.firstName?.[1]}`}
                  imageSource={
                    user?.profileAvatarId
                      ? `${Config.API_URL}/files?fid=${user?.profileAvatarId}&t=${accessToken}`
                      : undefined
                  }
                  style={{ width: 50, height: 50 }}
                  textStyles={{ fontSize: 12 }}
                />
                <View style={{ paddingLeft: 10, width: "80%" }}>
                  <Text>
                    {`${
                      user?.staffProfileIfStaff
                        ? user?.staffProfileIfStaff.title
                        : ""
                    } ${user?.firstName} ${user?.lastName}`}{" "}
                    {user.id === authUser?.id ? "(You)" : ""}
                  </Text>
                  {user?.bio && (
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{ color: theme.foregroundMuted, fontSize: 12 }}
                    >
                      {user?.bio}
                    </Text>
                  )}
                </View>
                {isAdmin(user) && (
                  <View
                    style={[
                      styles.flexRow,
                      styles.flexCenter,

                      {
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        backgroundColor: theme.backgroundMuted,
                        borderRadius: 30,
                      },
                    ]}
                  >
                    <Text>admin</Text>
                  </View>
                )}
              </TouchableOpacity>

              {chat.chatType === "group" &&
                isAdmin(authUser) &&
                user.id !== authUser?.id && (
                  <Popover
                    isOpen={
                      isPopoverOpen &&
                      activeMember &&
                      activeMember?.id === user.id
                    }
                    setIsOpen={setIsPopoverOpen}
                    variant="options"
                    start="right"
                    onPress={() => {
                      setActiveMember(user);
                    }}
                  >
                    <View
                      style={[
                        {
                          paddingHorizontal: 20,
                          backgroundColor: theme.backgroundMuted,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.paddingV,
                          {
                            borderBottomColor: theme.border,
                            borderBottomWidth: 1,
                          },
                        ]}
                        onPress={() => {
                          setIsPopoverOpen(false);
                          onRemoveMember(user);
                        }}
                      >
                        <Text
                          style={{ color: theme.destructive, fontSize: 16 }}
                        >
                          Remove {user?.firstName} {user?.lastName}
                        </Text>
                      </TouchableOpacity>
                      {!isAdmin(user) && (
                        <TouchableOpacity
                          style={[styles.paddingV]}
                          onPress={() => {
                            setIsPopoverOpen(false);
                            onMakeMemberAdmin(user);
                          }}
                        >
                          <Text style={{ color: theme.primary, fontSize: 16 }}>
                            Make {user?.firstName} {user?.lastName} an Admin
                          </Text>
                        </TouchableOpacity>
                      )}
                      {isAdmin(user) && (
                        <TouchableOpacity
                          style={[styles.paddingV]}
                          onPress={() => {
                            setIsPopoverOpen(false);
                            onRevokeAdmin(user);
                          }}
                        >
                          <Text
                            style={{ fontSize: 16, color: theme.destructive }}
                          >
                            Revoke {user?.firstName} {user?.lastName}'s Admin
                            Rights
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Popover>
                )}
            </View>
          );
        })}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
