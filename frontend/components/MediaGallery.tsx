import React, { useRef, useContext, useState, useEffect } from "react";

import { View, Image, StyleSheet, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScrollView } from "react-native-gesture-handler";

import { Text, TouchableOpacity } from "react-native";
import { AppThemeContext } from "../Theme";
import GlobalStyles from "../GlobalStyles";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import Config from "../Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

export interface GalleryItem {
  uri: string;
  type: "video" | "image";
  id?: number;
  name?: string;
  file?: File;
  mimetype?: string;
}

const MediaGallery = ({
  items,
  activeIndex,
  setActiveIndex,
  size,
}: {
  items: GalleryItem[];
  activeIndex?: number;
  setActiveIndex?: any;
  size?: number;
}) => {
  const scrollViewRef = useRef(null);

  const { theme } = useContext(AppThemeContext);

  const [SCREEN_WIDTH, setScreenWidth] = useState(
    size ? size : Dimensions.get("window").width
  );

  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    setToken(token || undefined);
  };

  Dimensions.addEventListener("change", ({ window, screen }) => {
    setScreenWidth(size ? size : window.width);
  });

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoToggle = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderItems = () => {
    return items.map((item, index) => (
      <View
        key={index}
        style={[
          styles.itemContainer,
          {
            // width: size ? "100%" : SCREEN_WIDTH,
            width: size ? size : SCREEN_WIDTH,
            justifyContent: "center",
            alignItems: "center",

            backgroundColor: theme.backgroundMuted,
          },
        ]}
      >
        {item.type == "image" && (
          <Image
            source={{
              uri: item.id
                ? `${Config.API_URL}/files/?fid=${item.id}&t=${token}`
                : item.uri,
            }}
            style={{
              // width: size ? size : "100%",
              width: size ? size : SCREEN_WIDTH,
              height: size ? size : 500,
              minWidth: size ? size : SCREEN_WIDTH,
              minHeight: size ? size : 500,
              maxWidth: size ? size : SCREEN_WIDTH,
              maxHeight: size ? size : 500,
              resizeMode: "cover",
              margin: "auto",
            }}
          />
        )}

        {item.type == "video" && (
          <TouchableOpacity activeOpacity={1} onPress={handleVideoToggle}>
            <Video
              source={{
                uri: item.id
                  ? `${Config.API_URL}/files/?fid=${item.id}&t=${token}`
                  : item.uri,
              }}
              style={{
                // width: size ? size : "100%",
                width: size ? size : SCREEN_WIDTH,
                height: size ? size : 500,
                backgroundColor: theme.secondary,
              }}
              resizeMode={ResizeMode.COVER}
              ref={videoRef}
              isLooping={true}
              shouldPlay={isPlaying}
              useNativeControls={false}
            />
            {!isPlaying && (
              <View style={[styles.playButton]}>
                <Feather
                  name="play-circle"
                  size={50}
                  color={theme.foreground}
                  style={{
                    shadowColor: theme.background,
                    shadowOpacity: 0.6,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <View
      style={[
        { maxWidth: size ? size : SCREEN_WIDTH, flex: 1, overflow: "hidden" },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={[
          {
            backgroundColor: theme.background,
            minWidth: size ? size : SCREEN_WIDTH,
            overflow: "hidden",
          },
        ]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / (size ? size : SCREEN_WIDTH));
          if (setActiveIndex) {
            setActiveIndex(index);
          }
        }}
      >
        {token && renderItems()}
      </ScrollView>
    </View>
  );
};

export default MediaGallery;

export const WebMediaGallery = ({
  items,
  activeIndex,
  setActiveIndex,
  size,
}: {
  items: GalleryItem[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  size?: number;
}) => {
  const { theme } = useContext(AppThemeContext);
  const scrollViewRef = useRef<ScrollView>(null);

  // const [SCREEN_WIDTH, setScreenWidth] = useState(
  //   Dimensions.get("window").width
  // );

  const SCREEN_WIDTH = size ? size : 500;

  // Dimensions.addEventListener("change", ({ window, screen }) => {
  //   setScreenWidth(window.width);
  // });

  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    getToken();
  }, []);

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoToggle = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    setToken(token || undefined);
  };

  const handleNext = () => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < items.length) {
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (size ? size : SCREEN_WIDTH),
        animated: true,
      });
      if (setActiveIndex) {
        setActiveIndex?.(nextIndex);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = activeIndex - 1;
    if (prevIndex >= 0) {
      scrollViewRef.current?.scrollTo({
        x: prevIndex * (size ? size : SCREEN_WIDTH),
        animated: true,
      });
      setActiveIndex?.(prevIndex);
    }
  };

  const renderItems = () => {
    return items.map((item, index) => (
      <View
        key={index}
        style={[
          styles.itemContainer,
          {
            flex: 1,
            width: size ? size : SCREEN_WIDTH,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
          },
        ]}
      >
        {(item.type === "image" ||
          item?.file?.type.split("/")[0] === "image") && (
          <Image
            source={{
              uri: item.id
                ? `${Config.API_URL}/files/?fid=${item.id}&t=${token}`
                : item.uri,
            }}
            style={{
              width: size ? size : 500,
              height: size ? size : 500,

              resizeMode: "cover",
            }}
          />
        )}

        {(item.type === "video" ||
          item?.file?.type.split("/")[0] === "video") && (
          <TouchableOpacity activeOpacity={1} onPress={handleVideoToggle}>
            <Video
              source={{
                uri: item.id
                  ? `${Config.API_URL}/files/?fid=${item.id}&t=${token}`
                  : item.uri,
              }}
              style={{
                flex: 1,
                minWidth: size ? size : 500,
                minHeight: size ? size : 500,
              }}
              resizeMode={ResizeMode.COVER}
              ref={videoRef}
              isLooping={true}
              shouldPlay={isPlaying}
              useNativeControls={false}
            />
            {!isPlaying && (
              <View style={[styles.playButton]}>
                <Feather
                  name="play-circle"
                  size={50}
                  color={theme.foreground}
                  style={{
                    shadowColor: theme.background,
                    shadowOpacity: 0.6,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <View
      style={[
        { maxWidth: size ? size : SCREEN_WIDTH, flex: 1, overflow: "hidden" },
      ]}
    >
      {/* <View style={styles.galleryContainer}> */}
      <ScrollView
        ref={scrollViewRef}
        style={[
          {
            minWidth: size ? size : SCREEN_WIDTH,
            overflow: "hidden",
            position: "relative",
            backgroundColor: theme.background,
          },
        ]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / (size ? size : SCREEN_WIDTH));
          setActiveIndex?.(index);
        }}
      >
        {token && renderItems()}
      </ScrollView>
      {/* </View> */}
      <View
        style={[
          styles.navigationContainer,
          { width: (size ? size : SCREEN_WIDTH) - 50 },
        ]}
      >
        <View>
          {activeIndex! > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              style={[
                styles.navigationItemContainer,
                { backgroundColor: theme.backgroundMuted },
              ]}
            >
              <Ionicons
                name="chevron-back-outline"
                style={styles.navigationText}
                size={16}
                color={theme.foreground}
              />
            </TouchableOpacity>
          )}
        </View>
        <View>
          {activeIndex! < items.length - 1 && (
            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.navigationItemContainer,
                { backgroundColor: theme.backgroundMuted },
              ]}
            >
              <Ionicons
                name="chevron-forward-outline"
                style={styles.navigationText}
                size={16}
                color={theme.foreground}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ...GlobalStyles,
  // galleryContainer: {
  //   height: 500,
  //   overflow: "hidden",
  // },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    position: "absolute",
    top: "40%",

    zIndex: 100,
  },
  navigationItemContainer: {
    borderRadius: 9999,
    opacity: 70,
    width: 30,
    height: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  navigationText: {
    fontSize: 16,

    textAlign: "center",
  },
  itemContainer: {
    height: "100%",
    display: "flex",
  },
  image: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  playButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
