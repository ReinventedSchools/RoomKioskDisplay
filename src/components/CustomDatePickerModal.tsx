import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

interface Props {
    visible: boolean;
    selectedDate: string;
    onSelect: (dateKey: string) => void;
    onCancel: () => void;
    accentColor?: string;
}

const DAYS_TO_SHOW = 60;

export default function CustomDatePickerModal({
    visible,
    selectedDate,
    onSelect,
    onCancel,
    accentColor = "#40CCA1",
}: Props) {
    const { width, height } = useWindowDimensions();
    const scrollRef = useRef<ScrollView | null>(null);
    const optionRowHeight = Math.round(Math.max(44, height * 0.055));
    const r = {
        overlayPadding: Math.round(width * 0.05),
        cardMaxWidth: Math.min(360, width * 0.9),
        cardPadding: Math.round(width * 0.05),
        cardRadius: Math.round(width * 0.04),
        titleSize: Math.max(16, Math.min(22, width * 0.045)),
        titleMargin: Math.round(width * 0.03),
        scrollMaxHeight: Math.min(320, height * 0.5),
        optionPaddingV: Math.round(height * 0.018),
        optionPaddingH: Math.round(width * 0.04),
        optionMargin: Math.round(width * 0.01),
        optionRadius: Math.round(width * 0.025),
        optionFontSize: Math.max(14, Math.min(18, width * 0.04)),
        badgeFontSize: Math.max(10, Math.min(13, width * 0.03)),
        cancelMargin: Math.round(width * 0.04),
        cancelPadding: Math.round(width * 0.03),
        cancelFontSize: Math.max(14, Math.min(17, width * 0.04)),
    };
    const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
        dayjs().add(i, "day"),
    );

    const getDateKey = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
    const parsed = selectedDate ? dayjs(selectedDate) : null;
    const selectedKey =
        parsed?.isValid() ? parsed.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        if (!visible || !scrollRef.current) return;
        const idx = dates.findIndex((d) => getDateKey(d) === selectedKey);
        if (idx >= 0) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    y: Math.max(0, idx * optionRowHeight - 80),
                    animated: true,
                });
            }, 100);
        }
    }, [visible, selectedKey, optionRowHeight]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent
            navigationBarTranslucent
            supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]}
        >
            <TouchableOpacity
                style={[styles.overlay, { width, height, padding: r.overlayPadding }]}
                activeOpacity={1}
                onPress={onCancel}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={[styles.card, { maxWidth: r.cardMaxWidth, padding: r.cardPadding, borderRadius: r.cardRadius }]}
                >
                    <Text style={[styles.title, { fontSize: r.titleSize, marginBottom: r.titleMargin }]}>Seleccionar fecha</Text>
                    <ScrollView
                        ref={scrollRef}
                        style={[styles.scroll, { maxHeight: r.scrollMaxHeight }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {dates.map((d) => {
                            const key = getDateKey(d);
                            const isSelected = key === selectedKey;
                            const isToday = key === dayjs().format("YYYY-MM-DD");
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.option,
                                        { paddingVertical: r.optionPaddingV, paddingHorizontal: r.optionPaddingH, marginBottom: r.optionMargin, borderRadius: r.optionRadius },
                                        isSelected && { backgroundColor: accentColor },
                                    ]}
                                    onPress={() => onSelect(key)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { fontSize: r.optionFontSize },
                                            isSelected && styles.optionTextSelected,
                                            isToday && !isSelected && styles.optionTextToday,
                                        ]}
                                    >
                                        {d.format("dddd D [de] MMMM")}
                                    </Text>
                                    {isToday && !isSelected && (
                                        <Text style={[styles.todayBadge, { fontSize: r.badgeFontSize }]}>Hoy</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.cancelBtn, { borderColor: accentColor, marginTop: r.cancelMargin, paddingVertical: r.cancelPadding, borderRadius: r.optionRadius }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.cancelText, { color: accentColor, fontSize: r.cancelFontSize }]}>
                            Cerrar
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxHeight: "75%",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontWeight: "700",
        color: "#111111",
        textAlign: "center",
    },
    scroll: {},
    option: {},
    optionText: {
        fontWeight: "500",
        color: "#1A1A1A",
        textTransform: "capitalize",
    },
    optionTextSelected: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    optionTextToday: {
        color: "#2D7D5E",
        fontWeight: "600",
    },
    todayBadge: {
        fontWeight: "700",
        color: "#2D7D5E",
        marginTop: 2,
    },
    cancelBtn: {
        borderWidth: 2,
        alignItems: "center",
    },
    cancelText: {
        fontWeight: "600",
    },
});
