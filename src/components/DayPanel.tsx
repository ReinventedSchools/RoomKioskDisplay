import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");
const BRAND_GREEN = "#40CCA1";

interface Props {
    roomName: string;
    events: any[];
    currentEvent: any | null;
    now: dayjs.Dayjs;
    theme: { primary: string; secondary: string; text: string; logo: any };
    onLogoPress: () => void;
    onCreateReservation: () => void;
}

export default function DayPanel({
    roomName,
    events,
    currentEvent,
    now,
    theme,
    onLogoPress,
    onCreateReservation,
}: Props) {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;

    const dayNum = now.format("D");
    const dayOfWeek = now.format("dddd").toUpperCase();

    const todayEvents = events
        .filter((e) => dayjs(e.start).isSame(now, "day"))
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    const daySize = isPortrait ? 216 : Math.min(300, height * 0.48);

    return (
        <View style={[styles.container, isPortrait && styles.containerPortrait]}>
            <TouchableOpacity onPress={onLogoPress} style={styles.logoContainer}>
                <Image source={theme.logo} style={styles.logo} />
            </TouchableOpacity>

            <Text style={[styles.roomName, { color: "#FFFFFF" }]} numberOfLines={1}>
                {roomName}
            </Text>

            <View style={styles.daySection}>
                <Text style={[styles.dayNumber, { fontSize: daySize, color: "#FFFFFF" }]}>
                    {dayNum}
                </Text>
                <Text style={[styles.dayOfWeek, { color: "#FFFFFF" }]}>{dayOfWeek}</Text>
            </View>

            <View style={styles.eventsSection}>
                <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>
                    Reservas del día
                </Text>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {todayEvents.length > 0 ? (
                        todayEvents.map((ev, idx) => {
                            const isActive =
                                now.isAfter(dayjs(ev.start)) &&
                                now.isBefore(dayjs(ev.end));
                            return (
                                <View
                                    key={idx}
                                    style={[
                                        styles.eventItem,
                                        isActive && {
                                            backgroundColor: "rgba(255,255,255,0.2)",
                                            borderRadius: 8,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.eventTitle,
                                            { color: "#FFFFFF" },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {ev.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.eventTime,
                                            { color: "#FFFFFF", opacity: 0.9 },
                                        ]}
                                    >
                                        {dayjs(ev.start).format("HH:mm")} -{" "}
                                        {dayjs(ev.end).format("HH:mm")}
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={[styles.emptyText, { color: "#FFFFFF" }]}>
                            Sin reservas
                        </Text>
                    )}
                </ScrollView>
            </View>

            <TouchableOpacity
                style={[styles.createButton, { borderColor: "#FFFFFF" }]}
                onPress={onCreateReservation}
            >
                <Text style={[styles.createButtonText, { color: "#FFFFFF" }]}>
                    Crear reserva
                </Text>
                <View style={[styles.plusButton, { backgroundColor: "#FFFFFF" }]}>
                    <Text style={[styles.plusText, { color: BRAND_GREEN }]}>+</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: 0,
        maxWidth: 520,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: BRAND_GREEN,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    containerPortrait: {
        maxWidth: "100%",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    logoContainer: {
        marginBottom: 8,
    },
    roomName: {
        fontSize: 44,
        fontWeight: "700",
        marginBottom: 2,
        opacity: 0.9,
        textAlign: "center",
        width: "100%",
    },
    logo: {
        width: 120,
        height: 48,
        resizeMode: "contain",
    },
    daySection: {
        marginBottom: 20,
        marginTop: -6,
        alignItems: "center",
        justifyContent: "center",
    },
    dayNumber: {
        fontWeight: "bold",
        textAlign: "center",
        includeFontPadding: false,
        marginTop: 0,
        marginBottom: 0,
    },
    dayOfWeek: {
        fontSize: 30,
        marginTop: 4,
        fontWeight: "500",
        textAlign: "center",
    },
    eventsSection: {
        flex: 1,
        minHeight: 120,
    },
    sectionTitle: {
        fontSize: 30,
        fontWeight: "600",
        marginBottom: 10,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    eventItem: {
        padding: 12,
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 30,
        fontWeight: "600",
    },
    eventTime: {
        fontSize: 30,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: "italic",
        opacity: 0.8,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    createButtonText: {
        fontSize: 24,
        fontWeight: "600",
    },
    plusButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    plusText: {
        fontSize: 28,
        fontWeight: "bold",
        lineHeight: 30,
    },
});
