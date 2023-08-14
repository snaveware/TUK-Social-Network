import { View, Text, ViewProps } from "./Themed";
import { useState, useEffect, useContext, ReactNode } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppThemeContext } from "../Theme";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import GlobalStyles from "../GlobalStyles";
import Button, { ButtonVariant } from "./Button";
import { Children } from "react";

export enum ModalVariant {
  success = "success",
  info = "info",
  danger = "danger",
  confirmation = "confirmation",
}

export default function Modal({
  message,
  showModal = false,
  variant,
  setShowModal,
  onConfirm,
  onCancel,
  children,
}: {
  message: string;
  showModal?: boolean;
  variant?: ModalVariant;
  setShowModal: any;
  onConfirm?: any;
  onCancel?: any;
  children?: ReactNode;
}) {
  const { theme } = useContext(AppThemeContext);

  const [color, setColor] = useState<string>(theme.foreground);

  useEffect(() => {
    if (variant === "success") {
      setColor(theme.primary);
    } else if (variant === "info") {
      setColor(theme.accent);
    } else if (variant === "danger") {
      setColor(theme.destructive);
    }
  }, [variant]);

  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        // Alert.alert("Modal has been closed.");
        setShowModal(false);
      }}
    >
      <View
        style={[
          styles.padding,
          {
            marginTop: 300,
            marginHorizontal: Platform.select({ ios: true, android: true })
              ? 30
              : 100,
            borderRadius: 5,
            borderColor: color === theme.foreground ? theme.border : color,
            borderWidth: 1,
            shadowColor: color === theme.foreground ? theme.border : color,
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 2 },
          },
        ]}
      >
        <View
          style={[
            styles.flexRow,
            styles.paddingV,
            {
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingLeft: 20,
            },
          ]}
        >
          {variant === "danger" && (
            <MaterialIcons name="error-outline" size={48} color={color} />
          )}
          {variant === "info" && (
            <AntDesign name="infocirlceo" size={48} color={color} />
          )}

          {variant === "success" && (
            <AntDesign name="checkcircleo" size={48} color={color} />
          )}

          <Feather
            onPress={() => setShowModal(false)}
            name="x-circle"
            size={24}
            color={color}
            style={{
              textAlign: "right",
              width: variant ? undefined : "100%",
            }}
          />
        </View>
        <Text style={[styles.paddingH, { color: color }]}>{message}</Text>
        {children && <>{children}</>}
        {variant == "confirmation" && (
          <View style={[styles.padding, styles.flexRow, styles.flexCenter]}>
            <Button
              text="Confirm"
              style={{ marginRight: 20 }}
              onPress={() => {
                setShowModal(false);
                if (onConfirm) {
                  onConfirm();
                }
              }}
            />
            <Button
              text="Cancel"
              variant={ButtonVariant.destructive}
              onPress={() => {
                setShowModal(false);
                if (onCancel) {
                  onCancel();
                }
              }}
            />
          </View>
        )}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
