import React from "react";
import { View, ImageBackground, StyleSheet, useWindowDimensions } from "react-native";

interface Props {
    background: any;
    children: React.ReactNode;
}

export default function RoomLayout({ background, children }: Props) {
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;

    return (
        <ImageBackground
            source={background}
            style={styles.background}
            imageStyle={{ resizeMode: "cover" }}
        >
            <View style={[styles.overlay, isPortrait && styles.overlayPortrait]}>
                {children}
            </View>
        </ImageBackground>
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
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    overlayPortrait: {
        flexDirection: "column",
    },
});
