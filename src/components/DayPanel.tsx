import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
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
    theme: {
        primary: string;
        secondary: string;
        text: string;
        logo: any;
        third?: string;
    };
    onCreateReservation: () => void;
}

export default function DayPanel({
    roomName,
    events,
    currentEvent,
    now,
    theme,
    onCreateReservation,
}: Props) {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;

    const dayNum = now.format("D");
    const monthName = now.format("MMMM").toUpperCase();
    const dayOfWeek = now.format("dddd").toUpperCase();

    const todayEvents = events
        .filter((e) => dayjs(e.start).isSame(now, "day"))
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    const daySize = isPortrait ? 216 : Math.min(300, height * 0.48);
    const panelTopPadding = isPortrait ? 48 : 64;
    const dayNumberMarginBottom = isPortrait ? 20 : 30;
    const daySectionPaddingBottom = isPortrait ? 24 : 44;
    const accentGreen = theme.third || BRAND_GREEN;

    return (
        <View
            style={[
                styles.container,
                isPortrait && styles.containerPortrait,
                { paddingTop: panelTopPadding, backgroundColor: accentGreen },
            ]}
        >
            <Text style={[styles.roomName, { color: "#FFFFFF" }]} numberOfLines={1}>
                {roomName}
            </Text>

            <View
                style={[
                    styles.daySection,
                    {
                        paddingTop: daySectionPaddingBottom,
                        paddingBottom: daySectionPaddingBottom,
                    },
                ]}
            >
                <Text style={[styles.dayOfWeek, { color: "#FFFFFF" }]}>{dayOfWeek}</Text>
                <Text
                    style={[
                        styles.dayNumber,
                        {
                            fontSize: daySize,
                            lineHeight: Math.floor(daySize * 0.78),
                            marginBottom: dayNumberMarginBottom,
                            color: "#FFFFFF",
                        },
                    ]}
                >
                    {dayNum}
                </Text>
                <Text style={[styles.dayMonth, { color: "#FFFFFF" }]}>{monthName}</Text>
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
                            const isPast = now.isAfter(dayjs(ev.end));
                            return (
                                <View
                                    key={idx}
                                    style={[
                                        styles.eventItem,
                                        isActive && {
                                            backgroundColor: "rgba(255,255,255,0.5)",
                                            borderRadius: 8,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.eventTitle,
                                            {
                                                color: "#FFFFFF",
                                                opacity: isPast ? 0.45 : isActive ? 0.65 : 1,
                                            },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {ev.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.eventTime,
                                            {
                                                color: "#FFFFFF",
                                                opacity: isPast ? 0.4 : isActive ? 0.6 : 0.9,
                                            },
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
                    <View style={[styles.plusHorizontal, { backgroundColor: accentGreen }]} />
                    <View style={[styles.plusVertical, { backgroundColor: accentGreen }]} />
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
        paddingBottom: 30,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    containerPortrait: {
        maxWidth: "100%",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    roomName: {
        fontSize: 44,
        fontWeight: "700",
        marginBottom: 2,
        opacity: 0.9,
        textAlign: "center",
        width: "100%",
    },
    daySection: {
        marginBottom: 10,
        marginTop: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    dayMonth: {
        fontSize: 30,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 4,
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
        marginBottom: 4,
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
    plusHorizontal: {
        position: "absolute",
        width: 18,
        height: 3,
        borderRadius: 2,
    },
    plusVertical: {
        position: "absolute",
        width: 3,
        height: 18,
        borderRadius: 2,
    },
});
