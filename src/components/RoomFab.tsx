import React from "react";
import { TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@src/config/colors";

interface Props {
    onPress: () => void;
    color?: string;
}

export default function RoomFab({ onPress, color }: Props) {
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;

    return (
        <TouchableOpacity
            style={[
                styles.fab,
                { backgroundColor: color },
                isPortrait && styles.fabPortrait,
            ]}
            onPress={onPress}
        >
            <Ionicons name="calendar-outline" size={isPortrait ? 22 : 28} color="white" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: colors.secondary,
        borderRadius: 50,
        padding: 16,
        elevation: 5,
    },
    fabPortrait: {
        bottom: 16,
        right: 16,
        padding: 12,
    },
});
