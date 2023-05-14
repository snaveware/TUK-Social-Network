import { StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import socket from "../../Socket";
import { useEffect } from "react";

export default function TabOneScreen() {
    // socket.connect();
    useEffect(() => {
        socket.on("connected", () => {
            console.log("socket connected..............");
            socket.emit("message", { message: "message from mobile client" });
        });

        socket.on("disconnected", () => {
            console.log("socket disconnected............");
        });

        socket.on("message", (message: any) => {
            console.log("new Message from server", message);
        });
    }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab One Changed</Text>
            <View
                style={styles.separator}
                lightColor="#eee"
                darkColor="rgba(255,255,255,0.1)"
            />
            <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
