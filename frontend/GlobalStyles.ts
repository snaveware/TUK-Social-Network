import Utils from "./Utils";
import DefaultAppTheme from "./Theme";
import { StyleSheet } from "react-native";
export default StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  LogoContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
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
  "pt-20": {
    paddingTop: 20,
  },
  fullView: {
    flex: 1,
    margin: "auto",
    width: "100%",
  },
  label: {
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 5,
  },
  input: {
    marginVertical: 5,
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
  errorBorder: {
    borderWidth: 0.5,
    borderColor: DefaultAppTheme.destructive,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  center: {
    textAlign: "center",
    width: "100%",
    margin: "auto",
  },

  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  flexCols: {
    flexDirection: "column",
  },
  padding: {
    padding: 10,
  },
  paddingV: {
    paddingVertical: 10,
  },
  paddingH: {
    paddingHorizontal: 20,
  },
  margin: {
    margin: 10,
  },
  marginV: {
    marginVertical: 10,
  },
  marginH: {
    marginHorizontal: 10,
  },
  inputContainer: {
    marginVertical: 2,
    paddingVertical: 2,
  },
});
