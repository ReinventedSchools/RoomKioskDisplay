import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import dayjs from "dayjs";

const MONTHS_ES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];
const DAYS_HEADER = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];

interface Props {
    events: any[];
    now: dayjs.Dayjs;
    theme: {
        primary: string;
        secondary: string;
        text: string;
        logo: any;
        third?: string;
    };
    onLogoPress?: () => void;
    onDayPress?: (date: dayjs.Dayjs) => void;
    isRoomReservedNow?: boolean;
}

export default function MonthCalendar({
    events,
    now,
    theme,
    onLogoPress,
    onDayPress,
    isRoomReservedNow = false,
}: Props) {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;

    const [viewDate, setViewDate] = useState(now);
    const accentGreen = isRoomReservedNow ? "#F7D159" : (theme.third || "#40CCA1");

    const year = viewDate.year();
    const month = viewDate.month();
    const monthStart = viewDate.startOf("month");
    const monthEnd = viewDate.endOf("month");

    const prevYear = () => setViewDate((d) => d.subtract(1, "year"));
    const nextYear = () => setViewDate((d) => d.add(1, "year"));

    const daysWithEvents = new Set(
        events.map((e) => dayjs(e.start).format("YYYY-MM-DD"))
    );

    const mondayOffset = (monthStart.day() + 6) % 7;
    const calendarStart = monthStart.subtract(mondayOffset, "day");
    const fridayOffset = (5 - monthEnd.day() + 7) % 7;
    const calendarEnd = monthEnd.add(fridayOffset, "day");

    const gridDates: dayjs.Dayjs[] = [];
    let cursor = calendarStart;
    while (cursor.isBefore(calendarEnd, "day") || cursor.isSame(calendarEnd, "day")) {
        if (cursor.day() !== 0 && cursor.day() !== 6) {
            gridDates.push(cursor);
        }
        cursor = cursor.add(1, "day");
    }

    const weeksCount = Math.max(1, Math.ceil(gridDates.length / 5));

    const isToday = (date: dayjs.Dayjs) => date.isSame(now, "day");
    const hasEvents = (date: dayjs.Dayjs) =>
        daysWithEvents.has(date.format("YYYY-MM-DD"));

    return (
        <View
            style={[
                styles.container,
                isPortrait && styles.containerPortrait,
            ]}
        >
            <View style={styles.topRow}>
                <TouchableOpacity
                    onPress={onLogoPress}
                    style={styles.logoContainer}
                    disabled={!onLogoPress}
                >
                    <Image source={theme.logo} style={styles.logo} />
                </TouchableOpacity>

                <View style={styles.yearRow}>
                    <TouchableOpacity onPress={prevYear} style={styles.navButton}>
                        <Text style={styles.navText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.yearText}>{year}</Text>
                    <TouchableOpacity onPress={nextYear} style={styles.navButton}>
                        <Text style={styles.navText}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.monthsRow}>
                {MONTHS_ES.map((m, i) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() =>
                            setViewDate((d) => d.month(i))
                        }
                        style={[
                            styles.monthChip,
                            styles.monthChipBorder,
                            i === month && styles.monthChipActive,
                            i === month && { backgroundColor: accentGreen, borderColor: "transparent" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.monthChipText,
                                i === month && styles.monthChipTextActive,
                                i === month && { fontWeight: "bold" },
                            ]}
                        >
                            {m}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.monthsDivider} />

            <View style={styles.daysHeader}>
                {DAYS_HEADER.map((d) => (
                    <Text
                        key={d}
                        style={styles.dayHeaderText}
                    >
                        {d}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {gridDates.map((date) => (
                    <View
                        key={date.format("YYYY-MM-DD")}
                        style={[styles.cell, { height: `${100 / weeksCount}%` }]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onDayPress?.(date)}
                            style={[
                                styles.dayCell,
                                isToday(date) && { backgroundColor: accentGreen },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayNum,
                                    isToday(date) && styles.dayNumToday,
                                    date.month() !== month && { opacity: 0.4 },
                                ]}
                            >
                                {date.date()}
                            </Text>
                            {hasEvents(date) && !isToday(date) && (
                                <View
                                    style={[
                                        styles.eventDot,
                                        { backgroundColor: accentGreen },
                                    ]}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1.2,
        minWidth: 0,
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    containerPortrait: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
    },
    logoContainer: {
        alignSelf: "flex-start",
    },
    logo: {
        width: 180,
        height: 72,
        resizeMode: "contain",
    },
    navButton: {
        padding: 8,
    },
    navText: {
        fontSize: 28,
        color: "#111111",
        fontWeight: "300",
    },
    yearText: {
        fontSize: 54,
        color: "#111111",
        fontWeight: "bold",
    },
    monthsRow: {
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "stretch",
        marginBottom: 10,
    },
    monthChipBorder: {
        borderWidth: 1,
        borderColor: "#DADADA",
    },
    monthChip: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 2,
    },
    monthChipText: {
        fontSize: 11,
        color: "#222222",
    },
    monthChipTextActive: {
        color: "#FFFFFF",
    },
    monthChipActive: {
        opacity: 1,
    },
    monthsDivider: {
        height: 1,
        backgroundColor: "#DDDDDD",
        marginTop: 12,
        marginBottom: 14,
    },
    daysHeader: {
        flexDirection: "row",
        marginBottom: 8,
    },
    dayHeaderText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        color: "#111111",
    },
    grid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        alignContent: "stretch",
    },
    cell: {
        width: "20%",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,
    },
    dayCell: {
        width: "88%",
        height: "88%",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    dayNum: {
        fontSize: 26,
        fontWeight: "500",
        color: "#222222",
    },
    dayNumToday: {
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    eventDot: {
        position: "absolute",
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});
