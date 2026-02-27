import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function RootLayout() {
    return (
        <View style={styles.root}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: styles.stackContent,
                    animation: "default",
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: "100%",
        minWidth: "100%",
        backgroundColor: "#000000",
    },
    stackContent: {
        flex: 1,
        width: "100%",
        backgroundColor: "transparent",
    },
});
