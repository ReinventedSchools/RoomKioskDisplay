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
    const panelWidth = Math.min(Math.max(width * 0.27, 280), 360);
    const panelTopPadding = Math.max(24, Math.min(48, height * 0.06));
    const daySize = Math.max(130, Math.min(200, height * 0.26));
    const dayNumberMarginBottom = Math.max(12, Math.min(24, height * 0.03));
    const daySectionPaddingBottom = Math.max(14, Math.min(30, height * 0.035));
    const roomNameSize = Math.max(28, Math.min(44, width * 0.038));
    const infoTextSize = Math.max(22, Math.min(30, width * 0.026));
    const buttonTextSize = Math.max(18, Math.min(24, width * 0.02));
    const plusSize = Math.max(30, Math.min(38, width * 0.03));

    const dayNum = now.format("D");
    const monthName = now.format("MMMM").toUpperCase();
    const dayOfWeek = now.format("dddd").toUpperCase();

    const todayEvents = events
        .filter((e) => dayjs(e.start).isSame(now, "day"))
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    const accentGreen = theme.third || BRAND_GREEN;
    const isRoomReservedNow = Boolean(currentEvent);
    const panelColor = isRoomReservedNow ? "#F7D159" : accentGreen;
    const panelTextColor = "#FFFFFF";
    const activeEventBg = isRoomReservedNow ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.5)";
    const plusStrokeColor = isRoomReservedNow ? "#F7D159" : accentGreen;

    return (
        <View
            style={[
                styles.container,
                {
                    width: panelWidth,
                    maxWidth: panelWidth,
                    paddingTop: panelTopPadding,
                    backgroundColor: panelColor,
                },
            ]}
        >
            <Text
                style={[styles.roomName, { color: panelTextColor, fontSize: roomNameSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {roomName}
            </Text>

            <View
                style={[
                    styles.daySection,
                    {
                        paddingTop: daySectionPaddingBottom + 2,
                        paddingBottom: daySectionPaddingBottom + 10,
                    },
                ]}
            >
                <Text style={[styles.dayOfWeek, { color: panelTextColor }]}>{dayOfWeek}</Text>
                <Text
                    style={[
                        styles.dayNumber,
                        {
                            fontSize: daySize,
                            lineHeight: Math.floor(daySize * 0.78),
                            marginBottom: dayNumberMarginBottom,
                            color: panelTextColor,
                        },
                    ]}
                >
                    {dayNum}
                </Text>
                <Text style={[styles.dayMonth, { color: panelTextColor, fontSize: infoTextSize }]}>
                    {monthName}
                </Text>
            </View>

            <View style={styles.eventsSection}>
                <Text style={[styles.sectionTitle, { color: panelTextColor, fontSize: infoTextSize }]}>
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
                                            backgroundColor: activeEventBg,
                                            borderRadius: 8,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.eventTitle,
                                            {
                                                color: panelTextColor,
                                                opacity: isPast ? 0.45 : isActive ? 0.65 : 1,
                                                fontSize: infoTextSize,
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
                                                color: panelTextColor,
                                                opacity: isPast ? 0.4 : isActive ? 0.6 : 0.9,
                                                fontSize: infoTextSize,
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
                        <Text style={[styles.emptyText, { color: panelTextColor }]}>
                            Sin reservas
                        </Text>
                    )}
                </ScrollView>
            </View>

            <TouchableOpacity
                style={[styles.createButton, { borderColor: panelTextColor }]}
                onPress={onCreateReservation}
            >
                <Text style={[styles.createButtonText, { color: panelTextColor, fontSize: buttonTextSize }]}>
                    Crear reserva
                </Text>
                <View
                    style={[
                        styles.plusButton,
                        {
                            width: plusSize,
                            height: plusSize,
                            borderRadius: plusSize / 2,
                            backgroundColor: "#FFFFFF",
                        },
                    ]}
                >
                    <View style={[styles.plusHorizontal, { backgroundColor: plusStrokeColor }]} />
                    <View style={[styles.plusVertical, { backgroundColor: plusStrokeColor }]} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexShrink: 0,
        flexGrow: 0,
        minWidth: 0,
        paddingHorizontal: 12,
        paddingBottom: 20,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    roomName: {
        fontWeight: "700",
        marginBottom: 6,
        opacity: 0.9,
        textAlign: "center",
        width: "100%",
    },
    daySection: {
        marginBottom: 0,
        marginTop: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    dayMonth: {
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
        fontSize: 28,
        marginBottom: 4,
        fontWeight: "500",
        textAlign: "center",
    },
    eventsSection: {
        flex: 1,
        minHeight: 120,
    },
    sectionTitle: {
        fontSize: 28,
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
        fontSize: 28,
        fontWeight: "600",
    },
    eventTime: {
        fontSize: 28,
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
        fontSize: 22,
        fontWeight: "600",
    },
    plusButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
