import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { roomsConfig } from "@src/config/roomsConfig";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona una Sala</Text>

            {Object.values(roomsConfig).map((room) => (
                <TouchableOpacity
                    key={room.id}
                    style={styles.card}
                    onPress={() => router.push(`/room/${room.id}`)}
                >
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomCampus}>{room.campus}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        minWidth: "100%",
        backgroundColor: "#000",
        padding: 30,
    },
    title: { color: "#fff", fontSize: 28, marginBottom: 24 },
    card: {
        backgroundColor: "#222",
        padding: 18,
        borderRadius: 10,
        marginBottom: 12,
    },
    roomName: { color: "white", fontSize: 20 },
    roomCampus: { color: "white", fontSize: 15 },
});
