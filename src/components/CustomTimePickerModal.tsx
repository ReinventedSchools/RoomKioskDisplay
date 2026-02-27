import React, { useEffect, useRef, useState } from "react";
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

interface Props {
    visible: boolean;
    value: string;
    onSelect: (hour: string, minute: string) => void;
    onCancel: () => void;
    accentColor?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function CustomTimePickerModal({
    visible,
    value,
    onSelect,
    onCancel,
    accentColor = "#40CCA1",
}: Props) {
    const { width, height } = useWindowDimensions();
    const hourRef = useRef<ScrollView | null>(null);
    const rowHeight = Math.max(36, Math.min(48, Math.round(height * 0.055)));
    const r = {
        overlayPadding: Math.round(width * 0.05),
        cardMaxWidth: Math.min(320, width * 0.9),
        cardPadding: Math.round(width * 0.05),
        cardRadius: Math.round(width * 0.04),
        titleSize: Math.max(16, Math.min(22, width * 0.045)),
        titleMargin: Math.round(width * 0.035),
        columnsGap: Math.round(width * 0.02),
        columnsMargin: Math.round(width * 0.04),
        labelSize: Math.max(10, Math.min(13, width * 0.03)),
        labelMargin: Math.round(width * 0.015),
        scrollHeight: Math.max(140, Math.min(220, height * 0.28)),
        scrollRadius: Math.round(width * 0.025),
        separatorSize: Math.max(18, Math.min(26, width * 0.055)),
        separatorMargin: Math.round(height * 0.035),
        rowRadius: Math.round(width * 0.02),
        rowTextSize: Math.max(15, Math.min(20, width * 0.04)),
        buttonsGap: Math.round(width * 0.03),
        btnPadding: Math.round(width * 0.03),
        btnRadius: Math.round(width * 0.025),
        btnFontSize: Math.max(14, Math.min(17, width * 0.04)),
    };
    const minuteRef = useRef<ScrollView | null>(null);
    const [tempHour, setTempHour] = useState(value ? dayjs(value).format("HH") : dayjs().format("HH"));
    const [tempMinute, setTempMinute] = useState(value ? dayjs(value).format("mm") : "00");

    const currentHour = tempHour;
    const currentMinute = tempMinute;

    useEffect(() => {
        if (visible) {
            setTempHour(value ? dayjs(value).format("HH") : dayjs().format("HH"));
            setTempMinute(value ? dayjs(value).format("mm") : "00");
        }
    }, [visible, value]);

    useEffect(() => {
        if (!visible) return;
        const hIdx = HOURS.indexOf(currentHour);
        const mIdx = MINUTES.indexOf(currentMinute);
        setTimeout(() => {
            if (hIdx >= 0 && hourRef.current) {
                hourRef.current.scrollTo({
                    y: Math.max(0, hIdx * rowHeight - 100),
                    animated: true,
                });
            }
            if (mIdx >= 0 && minuteRef.current) {
                minuteRef.current.scrollTo({
                    y: Math.max(0, mIdx * rowHeight - 100),
                    animated: true,
                });
            }
        }, 80);
    }, [visible, currentHour, currentMinute, rowHeight]);

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
                    <Text style={[styles.title, { fontSize: r.titleSize, marginBottom: r.titleMargin }]}>Seleccionar hora</Text>
                    <View style={[styles.columns, { gap: r.columnsGap, marginBottom: r.columnsMargin }]}>
                        <View style={styles.column}>
                            <Text style={[styles.columnLabel, { fontSize: r.labelSize, marginBottom: r.labelMargin }]}>Hora</Text>
                            <ScrollView
                                ref={hourRef}
                                style={[styles.scroll, { height: r.scrollHeight, borderRadius: r.scrollRadius }]}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={rowHeight}
                                snapToAlignment="start"
                                decelerationRate="fast"
                            >
                                {HOURS.map((h) => {
                                    const isSelected = h === currentHour;
                                    return (
                                        <TouchableOpacity
                                            key={h}
                                            style={[
                                                styles.row,
                                                { height: rowHeight, borderRadius: r.rowRadius },
                                                isSelected && { backgroundColor: accentColor },
                                            ]}
                                            onPress={() => setTempHour(h)}
                                        >
                                            <Text
                                                style={[
                                                    styles.rowText,
                                                    { fontSize: r.rowTextSize },
                                                    isSelected && styles.rowTextSelected,
                                                ]}
                                            >
                                                {h}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                        <Text style={[styles.separator, { fontSize: r.separatorSize, marginBottom: r.separatorMargin }]}>:</Text>
                        <View style={styles.column}>
                            <Text style={[styles.columnLabel, { fontSize: r.labelSize, marginBottom: r.labelMargin }]}>Min</Text>
                            <ScrollView
                                ref={minuteRef}
                                style={[styles.scroll, { height: r.scrollHeight, borderRadius: r.scrollRadius }]}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={rowHeight}
                                snapToAlignment="start"
                                decelerationRate="fast"
                            >
                                {MINUTES.map((m) => {
                                    const isSelected = m === currentMinute;
                                    return (
                                        <TouchableOpacity
                                            key={m}
                                            style={[
                                                styles.row,
                                                { height: rowHeight, borderRadius: r.rowRadius },
                                                isSelected && { backgroundColor: accentColor },
                                            ]}
                                            onPress={() => setTempMinute(m)}
                                        >
                                            <Text
                                                style={[
                                                    styles.rowText,
                                                    { fontSize: r.rowTextSize },
                                                    isSelected && styles.rowTextSelected,
                                                ]}
                                            >
                                                {m}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                    <View style={[styles.buttons, { gap: r.buttonsGap }]}>
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn, { paddingVertical: r.btnPadding, borderRadius: r.btnRadius }]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.cancelText, { fontSize: r.btnFontSize }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: accentColor, paddingVertical: r.btnPadding, borderRadius: r.btnRadius }]}
                            onPress={() => onSelect(tempHour, tempMinute)}
                        >
                            <Text style={[styles.confirmText, { fontSize: r.btnFontSize }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    card: {
        width: "100%",
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
    columns: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    column: {
        flex: 1,
        minWidth: 0,
    },
    columnLabel: {
        fontWeight: "600",
        color: "#5A6A65",
        textAlign: "center",
    },
    scroll: {
        borderWidth: 1,
        borderColor: "#CFE0DA",
        borderRadius: 10,
        backgroundColor: "#F5FBF9",
    },
    separator: {
        fontWeight: "700",
        color: "#3F4F4A",
    },
    row: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    rowText: {
        fontWeight: "500",
        color: "#1A1A1A",
    },
    rowTextSelected: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    buttons: {
        flexDirection: "row",
    },
    btn: {
        flex: 1,
        alignItems: "center",
    },
    cancelBtn: {
        backgroundColor: "#F3F3F3",
        borderWidth: 1,
        borderColor: "#D3D3D3",
    },
    cancelText: {
        fontWeight: "600",
        color: "#3A3A3A",
    },
    confirmText: {
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
