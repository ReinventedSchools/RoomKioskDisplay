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
const DAYS_HEADER = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

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
}

export default function MonthCalendar({ events, now, theme, onLogoPress }: Props) {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;

    const [viewDate, setViewDate] = useState(now);
    const accentGreen = theme.third || "#40CCA1";

    const year = viewDate.year();
    const month = viewDate.month();
    const monthStart = viewDate.startOf("month");
    const monthEnd = viewDate.endOf("month");
    const startDay = monthStart.day();
    const daysInMonth = monthEnd.date();

    const prevYear = () => setViewDate((d) => d.subtract(1, "year"));
    const nextYear = () => setViewDate((d) => d.add(1, "year"));

    const daysWithEvents = new Set(
        events.map((e) => dayjs(e.start).format("YYYY-MM-DD"))
    );

    const firstDayOffset = startDay;
    const prevMonthDays = monthStart.subtract(1, "month").daysInMonth();
    const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

    type DayCell = { day: number; isCurrentMonth: boolean };
    const grid: DayCell[] = [];

    for (let i = 0; i < firstDayOffset; i++) {
        grid.push({
            day: prevMonthDays - firstDayOffset + i + 1,
            isCurrentMonth: false,
        });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        grid.push({ day: d, isCurrentMonth: true });
    }
    let nextD = 1;
    while (grid.length < totalCells) {
        grid.push({ day: nextD++, isCurrentMonth: false });
    }

    const isToday = (cell: DayCell) =>
        cell.isCurrentMonth &&
        now.year() === year &&
        now.month() === month &&
        now.date() === cell.day;

    const getEventDateKey = (cell: DayCell, idx: number) => {
        if (cell.isCurrentMonth) {
            return `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
        }
        if (idx < firstDayOffset) {
            const prev = monthStart.subtract(1, "month");
            return `${prev.year()}-${String(prev.month() + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
        }
        const next = monthStart.add(1, "month");
        return `${next.year()}-${String(next.month() + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
    };

    const hasEvents = (cell: DayCell, idx: number) =>
        daysWithEvents.has(getEventDateKey(cell, idx));

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
                {grid.map((cell, i) => (
                    <View
                        key={i}
                        style={styles.cell}
                    >
                        <View
                            style={[
                                styles.dayCell,
                                isToday(cell) && { backgroundColor: accentGreen },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayNum,
                                    isToday(cell) && styles.dayNumToday,
                                    !cell.isCurrentMonth && { opacity: 0.4 },
                                ]}
                            >
                                {cell.day}
                            </Text>
                            {hasEvents(cell, i) && !isToday(cell) && (
                                <View
                                    style={[
                                        styles.eventDot,
                                        { backgroundColor: accentGreen },
                                    ]}
                                />
                            )}
                        </View>
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
        width: "14.2857%",
        height: "16.6667%",
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
