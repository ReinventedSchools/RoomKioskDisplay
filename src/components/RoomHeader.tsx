import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import dayjs from "dayjs";
import ClockDisplay from "@components/ClockDisplay";
import colors from "@src/config/colors";
import fonts from "@src/config/fonts";


interface Props {
    roomName: string;
    campus?: string;
    currentEvent: any;
    now: any;
    theme: {
        logo: any;
        primary: string;
        secondary: string;
        third: string;
        text: string;
    }
    onLogoPress?: () => void;
}

export default function RoomHeader({
    roomName,
    currentEvent,
    now,
    theme,
    onLogoPress,
}: Props) {
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;
    // En landscape, la altura es limitada: escalar fuentes para evitar superposiciùn
    const isCompactLandscape = !isPortrait && height < 500;

    const     titleSize = isPortrait
        ? fonts.title * 0.35
        : isCompactLandscape
          ? Math.min(fonts.title * 0.5, height * 0.15)
          : Math.min(fonts.title, height * 0.12);
    const subtitleSize = isPortrait
        ? fonts.subtitle * 0.7
        : isCompactLandscape
          ? fonts.subtitle * 0.8
          : fonts.subtitle;
    const dateSize = isPortrait ? fonts.date * 0.8 : fonts.date;
    const logoWidth = isPortrait ? 100 : isCompactLandscape ? 120 : 180;
    const logoHeight = isPortrait ? 40 : isCompactLandscape ? 45 : 70;

    return (
        <View style={[styles.container, isPortrait && styles.containerPortrait, !isPortrait && styles.containerLandscape]}>

            {/* LOGO */}
            <TouchableOpacity
                onPress={onLogoPress}
                style={[
                    styles.logoContainer,
                    isPortrait && styles.logoContainerPortrait,
                    isCompactLandscape && styles.logoContainerCompact,
                ]}
            >
                <Image source={theme.logo} style={[styles.logo, { width: logoWidth, height: logoHeight }]} />
            </TouchableOpacity>

            {/* INFORMACIùN */}
            <View style={[styles.info, isPortrait && styles.infoPortrait, !isPortrait && styles.infoLandscape]}>
                <Text
                    style={[styles.roomName, { color: theme.text, fontSize: titleSize }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {roomName}
                </Text>

                {currentEvent ? (
                    <>
                        <Text style={[styles.host, { color: theme.third || theme.primary, fontSize: subtitleSize }]}>{currentEvent.title}</Text>
                        <Text style={[styles.host, { color: theme.third || theme.primary, fontSize: subtitleSize }]}>
                            {dayjs(currentEvent.start).format("HH:mm")} -{" "}
                            {dayjs(currentEvent.end).format("HH:mm")}
                        </Text>
                    </>
                ) : (
                    <Text style={[styles.host, { fontSize: subtitleSize }]}>Disponible</Text>
                )}

                <View style={[styles.bottomInfo, isPortrait && styles.bottomInfoPortrait, !isPortrait && styles.bottomInfoLandscape]}>
                    <Text style={[styles.date, { fontSize: dateSize }, !isPortrait && styles.dateStacked]}>
                        {dayjs().format("DD MMM")}
                    </Text>
                    <ClockDisplay stacked={!isPortrait} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 12,
        minWidth: 0,
        maxWidth: 420,
    },
    containerLandscape: {
        justifyContent: "flex-end",
    },
    containerPortrait: {
        flex: 0,
        minHeight: 140,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    logoContainer: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 999,
    },
    logoContainerPortrait: {
        top: 8,
        left: 12,
    },
    logoContainerCompact: {
        top: 12,
        left: 16,
    },
    logo: {
        resizeMode: "contain",
    },
    info: {
        marginTop: 44,
        justifyContent: "flex-start",
        flex: 1,
    },
    infoLandscape: {
        marginTop: 0,
        flex: 0,
        position: "absolute" as const,
        bottom: 20,
        left: 20,
    },
    infoPortrait: {
        marginTop: 48,
        marginBottom: 8,
    },
    roomName: {
        fontSize: fonts.title,
        color: colors.text,
        fontFamily: fonts.family.bold,
    },
    host: {
        fontSize: fonts.subtitle,
        color: colors.text,
        marginVertical: 4,
        fontFamily: fonts.family.light,
    },
    reserve: {
        fontSize: fonts.subtitle,
        color: colors.primary,
        marginVertical: 5,
        fontFamily: fonts.family.light,
    },
    time: {
        fontSize: fonts.clock,
        color: colors.accent,
    },
    bottomInfo: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    bottomInfoLandscape: {
        marginTop: 6,
    },
    bottomInfoPortrait: {
        marginTop: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    date: {
        color: colors.text,
        marginTop: 0,
    },
    dateStacked: {
        marginBottom: 4,
    },
});
