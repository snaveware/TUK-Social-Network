import Utils from "./Utils";
import DefaultAppTheme from "./Theme";
import { StyleSheet } from "react-native";
export default StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
  },
  keyboardAvoidingView: {
    paddingHorizontal: 30,
  },
  LogoContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  primaryBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  "pt-25": {
    paddingTop: 25,
  },
  fullView: {
    flex: 1,
    width: Utils.isFromMedium() ? "30%" : "100%",
    margin: "auto",
  },
  label: {
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  primaryBtn: {
    backgroundColor: DefaultAppTheme.primary,
    borderRadius: 5,
    width: "50%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: "auto",
  },
  primaryBtnText: {
    color: DefaultAppTheme.primaryForeground,
    textAlign: "center",
  },
  error: {
    color: DefaultAppTheme.destructive,
    textTransform: "capitalize",
  },
});
