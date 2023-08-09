import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRef, useState, useEffect, useContext } from "react";
import { AppThemeContext } from "../Theme";
import { Feather } from "@expo/vector-icons";
import { View, Text } from "./Themed";
import GlobalStyles from "../GlobalStyles";

export default function VideoPlayer({ uri }: { uri: string }) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useContext(AppThemeContext);

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

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleVideoToggle}>
      <Video
        source={{
          uri: uri,
        }}
        style={{
          width: "100%",
          height: 500,
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
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  galleryContainer: {
    height: 500,
    overflow: "hidden",
  },

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
