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
        occupiedColor?: string;
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
    const isMobile = width < 600;
    const panelWidth = isMobile
        ? Math.max(120, Math.min(180, width * 0.38))
        : Math.min(Math.max(width * 0.27, 280), 360);
    const panelTopPadding = Math.max(24, Math.min(48, height * 0.06));
    const daySize = Math.max(90, Math.min(200, Math.min(panelWidth * 0.55, height * 0.26)));
    const dayNumberMarginBottom = Math.max(10, Math.min(24, panelWidth * 0.04));
    const daySectionPaddingBottom = Math.max(14, Math.min(30, height * 0.035));
    const roomNameSize = Math.max(22, Math.min(44, panelWidth * 0.1));
    const infoTextSize = Math.max(18, Math.min(32, panelWidth * 0.075));
    const dayOfWeekSize = Math.max(16, Math.min(28, panelWidth * 0.08));
    const buttonTextSize = Math.max(16, Math.min(24, panelWidth * 0.06));
    const plusSize = Math.max(28, Math.min(42, panelWidth * 0.1));

    const r = {
        paddingH: Math.round(panelWidth * 0.04),
        paddingB: Math.round(panelWidth * 0.055),
        radius: Math.round(panelWidth * 0.045),
        marginSm: Math.round(panelWidth * 0.015),
        marginMd: Math.round(panelWidth * 0.025),
        sectionMinH: Math.round(panelWidth * 0.4),
        eventPadding: Math.round(panelWidth * 0.04),
        eventMargin: Math.round(panelWidth * 0.025),
        createPadding: Math.round(panelWidth * 0.045),
        plusStroke: Math.round(plusSize * 0.08),
    };

    const dayNum = now.format("D");
    const monthName = now.format("MMMM").toUpperCase();
    const dayOfWeek = now.format("dddd").toUpperCase();

    const todayEvents = events
        .filter((e) => dayjs(e.start).isSame(now, "day"))
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    const accentGreen = theme.third || BRAND_GREEN;
    const occupiedColor = theme.occupiedColor ?? "#F7D159";
    const isRoomReservedNow = Boolean(currentEvent);
    const panelColor = isRoomReservedNow ? occupiedColor : accentGreen;
    const panelTextColor = "#FFFFFF";
    const activeEventBg = isRoomReservedNow ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.5)";
    const plusStrokeColor = isRoomReservedNow ? occupiedColor : accentGreen;

    return (
        <View
            style={[
                styles.container,
                {
                    width: panelWidth,
                    maxWidth: panelWidth,
                    paddingTop: panelTopPadding,
                    paddingHorizontal: r.paddingH,
                    paddingBottom: r.paddingB,
                    borderRadius: r.radius,
                    borderTopRightRadius: r.radius,
                    borderBottomRightRadius: r.radius,
                    backgroundColor: panelColor,
                },
            ]}
        >
            <Text
                style={[styles.roomName, { color: panelTextColor, fontSize: roomNameSize, marginBottom: r.marginSm }]}
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
                <Text style={[styles.dayOfWeek, { color: panelTextColor, fontSize: dayOfWeekSize, marginBottom: r.marginSm }]}>{dayOfWeek}</Text>
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
                <Text style={[styles.dayMonth, { color: panelTextColor, fontSize: infoTextSize, marginTop: r.marginSm }]}>
                    {monthName}
                </Text>
            </View>

            <View style={[styles.eventsSection, { minHeight: r.sectionMinH }]}>
                <Text style={[styles.sectionTitle, { color: panelTextColor, fontSize: infoTextSize, marginBottom: r.marginMd }]}>
                    Reservas del día
                </Text>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: r.paddingH }]}
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
                                        { padding: r.eventPadding, marginBottom: r.eventMargin, borderRadius: r.marginSm },
                                        isActive && { backgroundColor: activeEventBg },
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
                                                marginTop: r.marginSm,
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
                        <Text style={[styles.emptyText, { color: panelTextColor, fontSize: Math.max(12, infoTextSize * 0.5) }]}>
                            Sin reservas
                        </Text>
                    )}
                </ScrollView>
            </View>

            <TouchableOpacity
                style={[styles.createButton, { borderColor: panelTextColor, paddingVertical: r.createPadding }]}
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
                    <View style={[styles.plusHorizontal, { width: Math.round(plusSize * 0.5), height: r.plusStroke, backgroundColor: plusStrokeColor }]} />
                    <View style={[styles.plusVertical, { width: r.plusStroke, height: Math.round(plusSize * 0.5), backgroundColor: plusStrokeColor }]} />
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
    },
    roomName: {
        fontWeight: "700",
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
    },
    dayNumber: {
        fontWeight: "bold",
        textAlign: "center",
        includeFontPadding: false,
        marginTop: 0,
        marginBottom: 0,
    },
    dayOfWeek: {
        fontWeight: "500",
        textAlign: "center",
    },
    eventsSection: {
        flex: 1,
    },
    sectionTitle: {
        fontWeight: "600",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {},
    eventItem: {},
    eventTitle: {
        fontWeight: "600",
    },
    eventTime: {},
    emptyText: {
        fontStyle: "italic",
        opacity: 0.8,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
    },
    createButtonText: {
        fontWeight: "600",
    },
    plusButton: {
        alignItems: "center",
        justifyContent: "center",
    },
    plusHorizontal: {
        position: "absolute",
        borderRadius: 2,
    },
    plusVertical: {
        position: "absolute",
        borderRadius: 2,
    },
});
