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
        occupiedColor?: string;
    };
    onLogoPress?: () => void;
    onDayPress?: (date: dayjs.Dayjs) => void;
    isRoomReservedNow?: boolean;
    onViewMonthChange?: (date: dayjs.Dayjs) => void;
}

export default function MonthCalendar({
    events,
    now,
    theme,
    onLogoPress,
    onDayPress,
    isRoomReservedNow = false,
    onViewMonthChange,
}: Props) {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;
    const isMobile = width < 600;

    const calendarWidth = width * (isMobile ? 0.62 : 0.73);
    const r = {
        logoSize: { width: calendarWidth * 0.225, height: calendarWidth * 0.09 },
        containerPadding: Math.round(width * (isMobile ? 0.02 : 0.025)),
        radius: Math.round(width * 0.025),
        topRowMargin: Math.round(width * 0.02),
        yearGap: Math.round(width * 0.02),
        navPadding: Math.round(width * 0.02),
        yearFontSize: Math.max(9, Math.min(27, width * 0.055)),
        navFontSize: Math.max(8, Math.min(14, width * 0.028)),
        monthChipFontSize: Math.max(9, Math.min(13, width * 0.025)),
        monthChipPadding: Math.round(width * (isMobile ? 0.0075 : 0.01)),
        monthChipMargin: Math.round(width * 0.005),
        monthRowMargin: Math.round(width * 0.02),
        dividerMargin: Math.round(width * 0.02),
        dayHeaderFontSize: Math.max(10, Math.min(14, width * 0.03)),
        dayNumFontSize: Math.max(14, Math.min(28, width * 0.055)),
        daysHeaderMargin: Math.round(width * 0.02),
        cellPadding: Math.round(width * 0.003),
        eventDotSize: Math.max(3, Math.min(5, width * 0.012)),
    };

    const [viewDate, setViewDate] = useState(now);
    const occupiedColor = theme.occupiedColor ?? "#F7D159";
    const accentGreen = isRoomReservedNow ? occupiedColor : (theme.third || "#40CCA1");

    const year = viewDate.year();
    const month = viewDate.month();
    const monthStart = viewDate.startOf("month");
    const monthEnd = viewDate.endOf("month");

    const prevYear = () => setViewDate((d) => d.subtract(1, "year"));
    const nextYear = () => setViewDate((d) => d.add(1, "year"));

    React.useEffect(() => {
        onViewMonthChange?.(viewDate.startOf("month"));
    }, [viewDate, onViewMonthChange]);

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
                { padding: r.containerPadding, borderRadius: r.radius, borderTopLeftRadius: r.radius, borderBottomLeftRadius: r.radius },
            ]}
        >
            <View style={[styles.topRow, { marginBottom: r.topRowMargin }]}>
                <TouchableOpacity
                    onPress={onLogoPress}
                    style={styles.logoContainer}
                    disabled={!onLogoPress}
                >
                    <Image source={theme.logo} style={[styles.logo, r.logoSize]} />
                </TouchableOpacity>

                <View style={[styles.yearRow, { gap: r.yearGap }]}>
                    <TouchableOpacity onPress={prevYear} style={[styles.navButton, { padding: r.navPadding }]}>
                        <Text style={[styles.navText, { fontSize: r.navFontSize }]}>‹</Text>
                    </TouchableOpacity>
                    <Text style={[styles.yearText, { fontSize: r.yearFontSize }]}>{year}</Text>
                    <TouchableOpacity onPress={nextYear} style={[styles.navButton, { padding: r.navPadding }]}>
                        <Text style={[styles.navText, { fontSize: r.navFontSize }]}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.monthsRow, { marginBottom: r.monthRowMargin }]}>
                {MONTHS_ES.map((m, i) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => setViewDate((d) => d.month(i))}
                        style={[
                            styles.monthChip,
                            styles.monthChipBorder,
                            { paddingVertical: r.monthChipPadding, marginHorizontal: r.monthChipMargin, borderRadius: r.cellPadding * 2 },
                            i === month && styles.monthChipActive,
                            i === month && { backgroundColor: accentGreen, borderColor: "transparent" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.monthChipText,
                                { fontSize: r.monthChipFontSize },
                                i === month && styles.monthChipTextActive,
                                i === month && { fontWeight: "bold" },
                            ]}
                        >
                            {m}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.monthsDivider, { marginTop: r.dividerMargin, marginBottom: r.dividerMargin }]} />

            <View style={[styles.daysHeader, { marginBottom: r.daysHeaderMargin }]}>
                {DAYS_HEADER.map((d) => (
                    <Text
                        key={d}
                        style={[styles.dayHeaderText, { fontSize: r.dayHeaderFontSize }]}
                    >
                        {d}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {gridDates.map((date) => (
                    <View
                        key={date.format("YYYY-MM-DD")}
                        style={[styles.cell, { height: `${100 / weeksCount}%`, padding: r.cellPadding }]}
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
                                    { fontSize: r.dayNumFontSize },
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
                                        { backgroundColor: accentGreen, width: r.eventDotSize, height: r.eventDotSize, borderRadius: r.eventDotSize / 2, bottom: r.cellPadding },
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
        backgroundColor: "#FFFFFF",
    },
    containerPortrait: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    logoContainer: {
        alignSelf: "flex-start",
    },
    logo: {
        resizeMode: "contain",
    },
    navButton: {},
    navText: {
        color: "#111111",
        fontWeight: "300",
    },
    yearText: {
        color: "#111111",
        fontWeight: "bold",
    },
    monthsRow: {
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "stretch",
    },
    monthChipBorder: {
        borderWidth: 1,
        borderColor: "#DADADA",
    },
    monthChip: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    monthChipText: {
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
    },
    daysHeader: {
        flexDirection: "row",
    },
    dayHeaderText: {
        flex: 1,
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
    },
    dayCell: {
        width: "88%",
        height: "88%",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    dayNum: {
        fontWeight: "500",
        color: "#222222",
    },
    dayNumToday: {
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    eventDot: {
        position: "absolute",
    },
});
