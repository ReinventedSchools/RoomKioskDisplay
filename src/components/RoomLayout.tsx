import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";

interface Props {
    background: any;
    children: React.ReactNode;
}

export default function RoomLayout({ background, children }: Props) {
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;

    return (
        <View style={styles.background}>
            <View style={[styles.overlay, isPortrait && styles.overlayPortrait]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
    },
    overlayPortrait: {
        flexDirection: "column",
    },
});
