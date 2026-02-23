import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    StyleSheet,
    Animated,
    useWindowDimensions,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import fonts from "@config/fonts";

dayjs.locale("es");

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface Props {
    visible: boolean;
    form: {
        subject: string;
        start: string;
        end: string;
    };
    pickerMode: "start" | "end" | null;
    setPickerMode: (mode: "start" | "end" | null) => void;
    onClose: () => void;
    onChange: (key: "subject" | "start" | "end", value: string) => void;
    onSubmit: () => void;
    theme: {
        primary: string;
        secondary: string;
        text: string;
        modalButton?: string;
        third?: string;
    };
    events: any[];
    validationMessage?: string;
    validationIsError?: boolean;
}

export default function ReservationModal({
    visible,
    form,
    pickerMode,
    setPickerMode,
    onClose,
    onChange,
    onSubmit,
    theme,
    events,
    validationMessage = "",
    validationIsError = false,
}: Props) {
    const { width, height } = useWindowDimensions();
    const accentGreen = theme.third || "#40CCA1";
    const pastelRed = "#E58C8C";
    const isCompact = width < 1040;
    const stackTimeSelectors = width < 1180;
    const modalContainerResponsive = {
        width: (isCompact ? "96%" : "90%") as `${number}%`,
        minHeight: isCompact ? Math.max(420, height * 0.62) : 460,
    };
    const formColumnResponsive = {
        paddingHorizontal: Math.max(16, Math.min(28, width * 0.025)),
        paddingVertical: Math.max(18, Math.min(28, height * 0.03)),
    };
    const dateColumnResponsive = {
        width: isCompact ? "34%" as const : "31%" as const,
        minWidth: isCompact ? 220 : 290,
        padding: isCompact ? 18 : 24,
    };
    const dateNumberSize = isCompact ? Math.max(120, Math.min(165, width * 0.14)) : 180;
    const dateMonthSize = isCompact ? 30 : 36;
    const dateDaySize = isCompact ? 28 : 34;
    const dateReservedSize = isCompact ? 22 : 26;
    const isReservedConflict =
        validationIsError &&
        validationMessage.toLowerCase().includes("ya está reservado");
    const rightColumnColor = isReservedConflict ? pastelRed : accentGreen;
    const reservedMessageAnim = useRef(new Animated.Value(0)).current;
    const dateContentAnim = useRef(new Animated.Value(1)).current;
    const rightPanelFlipAnim = useRef(new Animated.Value(0)).current;
    const reservationItemAnimsRef = useRef<Record<string, Animated.Value>>({});
    const reservationLoopsRef = useRef<Record<string, Animated.CompositeAnimation>>({});
    const reservationsScrollRef = useRef<ScrollView | null>(null);
    const reservationItemLayoutsRef = useRef<Record<string, { y: number; height: number }>>({});
    const pendingConflictScrollKeyRef = useRef<string | null>(null);
    const startDateInputRef = useRef<any>(null);
    const [showReservedMessage, setShowReservedMessage] = useState(false);
    const [showDayReservations, setShowDayReservations] = useState(false);
    const getDateValue = (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD") : "";
    const getFriendlyDateLabel = (value: string) => {
        if (!value) return "Seleccionar fecha";
        const raw = dayjs(value).format("dddd D [de] MMMM");
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    };
    const getHourValue = (value: string) =>
        value ? dayjs(value).format("HH") : "";
    const getMinuteValue = (value: string) =>
        value ? dayjs(value).format("mm") : "";
    const getValidDateOrToday = (value: string) => {
        if (!value) return dayjs();
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed : dayjs();
    };
    const sharedDateValue = getDateValue(form.start || form.end);
    const sharedDateLabel = getFriendlyDateLabel(form.start || form.end);
    const selectedDate = getValidDateOrToday(form.start || form.end);
    const selectedDateKey = selectedDate.format("YYYY-MM-DD");
    const [displayedDateKey, setDisplayedDateKey] = useState(selectedDateKey);
    const displayedDate = dayjs(displayedDateKey);
    const monthName = displayedDate.format("MMMM").toUpperCase();
    const dayNumber = displayedDate.format("D");
    const dayName = displayedDate.format("dddd").toUpperCase();
    const selectedDayEvents = events
        .filter((ev) => dayjs(ev.start).isSame(selectedDate, "day"))
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
    const selectedStart = form.start ? dayjs(form.start) : null;
    const selectedEnd = form.end ? dayjs(form.end) : null;
    const hasValidRange =
        Boolean(selectedStart && selectedEnd) &&
        Boolean(selectedStart?.isValid()) &&
        Boolean(selectedEnd?.isValid()) &&
        Boolean(selectedEnd?.isAfter(selectedStart));
    const getReservationKey = (ev: any, idx: number) =>
        `${dayjs(ev.start).toISOString()}_${dayjs(ev.end).toISOString()}_${ev.title || "res"}_${idx}`;
    const conflictingReservationKeys = hasValidRange
        ? selectedDayEvents
            .map((ev, idx) => {
                const evStart = dayjs(ev.start);
                const evEnd = dayjs(ev.end);
                const overlaps =
                    selectedStart!.isBefore(evEnd) &&
                    selectedEnd!.isAfter(evStart);
                return overlaps ? getReservationKey(ev, idx) : null;
            })
            .filter((key): key is string => Boolean(key))
        : [];
    const conflictingKeysSignature = conflictingReservationKeys.join("|");

    const mergeDateAndTime = (datePart: string, hourPart: string, minutePart: string) =>
        dayjs(`${datePart}T${hourPart}:${minutePart}`);

    const handleSharedDateChange = (datePart: string) => {
        if (!datePart) {
            onChange("start", "");
            onChange("end", "");
            return;
        }

        const startHour = getHourValue(form.start) || dayjs().format("HH");
        const startMinute = getMinuteValue(form.start) || "00";
        const endHour = getHourValue(form.end) || dayjs().format("HH");
        const endMinute = getMinuteValue(form.end) || "30";

        const startMerged = mergeDateAndTime(datePart, startHour, startMinute);
        const endMerged = mergeDateAndTime(datePart, endHour, endMinute);

        if (startMerged.isValid()) {
            onChange("start", startMerged.toISOString());
        }
        if (endMerged.isValid()) {
            onChange("end", endMerged.toISOString());
        }
    };

    const handleHourPartChange = (key: "start" | "end", hourPart: string) => {
        if (!hourPart) return;
        const currentDate = getDateValue(form[key]) || dayjs().format("YYYY-MM-DD");
        const minutePart = getMinuteValue(form[key]) || "00";
        const merged = dayjs(`${currentDate}T${hourPart}:${minutePart}`);
        if (merged.isValid()) {
            onChange(key, merged.toISOString());
        }
    };

    const handleMinutePartChange = (key: "start" | "end", minutePart: string) => {
        if (!minutePart) return;
        const currentDate = getDateValue(form[key]) || dayjs().format("YYYY-MM-DD");
        const hourPart = getHourValue(form[key]) || "00";
        const merged = dayjs(`${currentDate}T${hourPart}:${minutePart}`);
        if (merged.isValid()) {
            onChange(key, merged.toISOString());
        }
    };

    const openDatePicker = (inputRef: React.RefObject<any>) => {
        if (Platform.OS !== "web") return;
        const input = inputRef.current;
        if (!input) return;
        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }
        if (typeof input.click === "function") {
            input.click();
        }
    };

    const webDateInputStyle = {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
        opacity: 0,
        width: "100%",
        outline: "none",
        boxSizing: "border-box" as const,
        cursor: "pointer",
    };
    const webSelectStyle = {
        backgroundColor: "#FFFFFF",
        color: "#1A1A1A",
        border: "0.0625rem solid #CFE0DA",
        borderRadius: "0.625rem",
        width: "auto",
        flex: 1,
        minWidth: 0,
        padding: "0.6875rem 0.75rem",
        outline: "none",
        boxSizing: "border-box" as const,
        fontSize: "0.9375rem",
        fontWeight: "500" as const,
    };

    useEffect(() => {
        if (isReservedConflict) {
            setShowReservedMessage(true);
            reservedMessageAnim.setValue(0);
            Animated.timing(reservedMessageAnim, {
                toValue: 1,
                duration: 320,
                useNativeDriver: true,
            }).start();
            return;
        }
        if (!showReservedMessage) return;
        Animated.timing(reservedMessageAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setShowReservedMessage(false);
            }
        });
    }, [isReservedConflict, reservedMessageAnim, showReservedMessage]);

    useEffect(() => {
        if (selectedDateKey === displayedDateKey) return;
        Animated.timing(dateContentAnim, {
            toValue: 0,
            duration: 170,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished) return;
            setDisplayedDateKey(selectedDateKey);
            Animated.timing(dateContentAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }).start();
        });
    }, [selectedDateKey, displayedDateKey, dateContentAnim]);

    useEffect(() => {
        if (!visible) {
            setShowDayReservations(false);
            rightPanelFlipAnim.setValue(0);
        }
    }, [visible, rightPanelFlipAnim]);

    useEffect(() => {
        const activeConflicts = new Set(conflictingReservationKeys);

        Object.keys(reservationLoopsRef.current).forEach((key) => {
            if (!showDayReservations || !activeConflicts.has(key)) {
                reservationLoopsRef.current[key].stop();
                delete reservationLoopsRef.current[key];
                if (reservationItemAnimsRef.current[key]) {
                    reservationItemAnimsRef.current[key].setValue(0);
                }
            }
        });

        if (!showDayReservations || conflictingReservationKeys.length === 0) return;

        conflictingReservationKeys.forEach((key) => {
            if (!reservationItemAnimsRef.current[key]) {
                reservationItemAnimsRef.current[key] = new Animated.Value(0);
            }
            if (reservationLoopsRef.current[key]) return;

            const anim = reservationItemAnimsRef.current[key];
            anim.setValue(0);
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 160,
                        useNativeDriver: true,
                    }),
                    Animated.spring(anim, {
                        toValue: 0,
                        friction: 4,
                        tension: 105,
                        useNativeDriver: true,
                    }),
                ]),
            );
            reservationLoopsRef.current[key] = loop;
            loop.start();
        });
    }, [showDayReservations, conflictingKeysSignature, conflictingReservationKeys]);

    useEffect(() => {
        if (!showDayReservations || conflictingReservationKeys.length === 0) {
            pendingConflictScrollKeyRef.current = null;
            return;
        }
        const firstConflictKey = conflictingReservationKeys[0];
        pendingConflictScrollKeyRef.current = firstConflictKey;
        const tryScroll = () => {
            const targetLayout = reservationItemLayoutsRef.current[firstConflictKey];
            if (!targetLayout || !reservationsScrollRef.current) return false;
            reservationsScrollRef.current.scrollTo({
                y: Math.max(targetLayout.y - 12, 0),
                animated: true,
            });
            pendingConflictScrollKeyRef.current = null;
            return true;
        };
        if (tryScroll()) return;
        const timeoutId = setTimeout(() => {
            tryScroll();
        }, 120);
        return () => clearTimeout(timeoutId);
    }, [showDayReservations, conflictingKeysSignature, conflictingReservationKeys]);

    useEffect(() => {
        return () => {
            Object.values(reservationLoopsRef.current).forEach((loop) => loop.stop());
            reservationLoopsRef.current = {};
        };
    }, []);

    const reservedMessageAnimatedStyle = {
        opacity: reservedMessageAnim,
        transform: [
            {
                translateY: reservedMessageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                }),
            },
        ],
    };
    const dateMainContentAnimatedStyle = {
        opacity: dateContentAnim,
        transform: [
            {
                translateY: reservedMessageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -24],
                }),
            },
            {
                scale: dateContentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                }),
            },
        ],
    };
    const frontFaceAnimatedStyle = {
        transform: [
            { perspective: 1200 },
            {
                rotateY: rightPanelFlipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                }),
            },
        ],
        opacity: rightPanelFlipAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0, 0],
        }),
    };
    const backFaceAnimatedStyle = {
        transform: [
            { perspective: 1200 },
            {
                rotateY: rightPanelFlipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-180deg", "0deg"],
                }),
            },
        ],
        opacity: rightPanelFlipAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        }),
    };
    const toggleRightColumnView = () => {
        const toReservations = !showDayReservations;
        setShowDayReservations(toReservations);
        Animated.timing(rightPanelFlipAnim, {
            toValue: toReservations ? 1 : 0,
            duration: 420,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, modalContainerResponsive]}>
                    <View style={[styles.formColumn, formColumnResponsive]}>
                        <Text style={styles.modalTitle}>Nueva reserva</Text>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu nombre"
                            placeholderTextColor="#8A8A8A"
                            value={form.subject}
                            onChangeText={(t) => onChange("subject", t)}
                        />

                        {Platform.OS === "web" ? (
                            <>
                                <View style={styles.pickerCard}>
                                    <Text style={styles.timeGroupLabel}>Fecha</Text>
                                    <TouchableOpacity
                                        style={styles.dateInputWrap}
                                        onPress={() => openDatePicker(startDateInputRef)}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[
                                                styles.dateInputOverlayText,
                                                !sharedDateValue && styles.dateInputPlaceholderText,
                                            ]}
                                            pointerEvents="none"
                                        >
                                            {sharedDateLabel}
                                        </Text>
                                        <Text style={styles.dateInputIcon} pointerEvents="none">
                                            📅
                                        </Text>
                                        <input
                                            ref={startDateInputRef}
                                            type="date"
                                            title="Seleccionar fecha de la reserva"
                                            style={webDateInputStyle}
                                            value={sharedDateValue}
                                            onChange={(e) => handleSharedDateChange(e.target.value)}
                                        />
                                    </TouchableOpacity>

                                    <View style={[styles.timeGroupsRow, stackTimeSelectors && styles.timeGroupsRowStacked]}>
                                        <View style={styles.timeGroup}>
                                            <Text style={styles.timeGroupLabel}>Hora de inicio</Text>
                                            <View style={styles.webTimeRow}>
                                                <select
                                                    title="Seleccionar hora de inicio"
                                                    style={webSelectStyle}
                                                    value={getHourValue(form.start)}
                                                    onChange={(e) => handleHourPartChange("start", e.target.value)}
                                                >
                                                    <option value="">HH</option>
                                                    {HOURS.map((h) => (
                                                        <option key={`start-hour-${h}`} value={h}>
                                                            {h}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Text style={styles.timeSeparator}>:</Text>
                                                <select
                                                    title="Seleccionar minuto de inicio"
                                                    style={webSelectStyle}
                                                    value={getMinuteValue(form.start)}
                                                    onChange={(e) => handleMinutePartChange("start", e.target.value)}
                                                >
                                                    <option value="">MM</option>
                                                    {MINUTES.map((m) => (
                                                        <option key={`start-minute-${m}`} value={m}>
                                                            {m}
                                                        </option>
                                                    ))}
                                                </select>
                                            </View>
                                        </View>

                                        <View style={styles.timeGroup}>
                                            <Text style={styles.timeGroupLabel}>Hora de finalización</Text>
                                            <View style={styles.webTimeRow}>
                                                <select
                                                    title="Seleccionar hora de finalización"
                                                    style={webSelectStyle}
                                                    value={getHourValue(form.end)}
                                                    onChange={(e) => handleHourPartChange("end", e.target.value)}
                                                >
                                                    <option value="">HH</option>
                                                    {HOURS.map((h) => (
                                                        <option key={`end-hour-${h}`} value={h}>
                                                            {h}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Text style={styles.timeSeparator}>:</Text>
                                                <select
                                                    title="Seleccionar minuto de finalización"
                                                    style={webSelectStyle}
                                                    value={getMinuteValue(form.end)}
                                                    onChange={(e) => handleMinutePartChange("end", e.target.value)}
                                                >
                                                    <option value="">MM</option>
                                                    {MINUTES.map((m) => (
                                                        <option key={`end-minute-${m}`} value={m}>
                                                            {m}
                                                        </option>
                                                    ))}
                                                </select>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Hora de inicio</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setPickerMode("start")}
                                >
                                    <Text style={{ color: form.start ? "#111111" : "#8A8A8A" }}>
                                        {form.start
                                            ? dayjs(form.start).format("DD/MM/YYYY HH:mm")
                                            : "Selecciona fecha y hora"}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.label}>Hora de salida</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setPickerMode("end")}
                                >
                                    <Text style={{ color: form.end ? "#111111" : "#8A8A8A" }}>
                                        {form.end
                                            ? dayjs(form.end).format("DD/MM/YYYY HH:mm")
                                            : "Selecciona fecha y hora"}
                                    </Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={pickerMode !== null}
                                    mode="datetime"
                                    onConfirm={(date) => {
                                        const iso = dayjs(date).toISOString();
                                        if (pickerMode === "start") onChange("start", iso);
                                        if (pickerMode === "end") onChange("end", iso);
                                        setPickerMode(null);
                                    }}
                                    onCancel={() => setPickerMode(null)}
                                />
                            </>
                        )}

                        {validationMessage && !isReservedConflict && validationIsError ? (
                            <Text
                                style={[
                                    styles.validationMessage,
                                    { color: "#f44336" },
                                ]}
                            >
                                {validationMessage}
                            </Text>
                        ) : null}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: validationIsError
                                            ? "#A7A7A7"
                                            : (theme.modalButton || accentGreen),
                                        opacity: validationIsError ? 0.6 : 1,
                                    },
                                ]}
                                onPress={onSubmit}
                                disabled={validationIsError}
                            >
                                <Text style={styles.buttonText}>Reservar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.dateColumn,
                            dateColumnResponsive,
                            { backgroundColor: rightColumnColor },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.viewReservationsButtonRight}
                            onPress={toggleRightColumnView}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.viewReservationsText}>
                                {showDayReservations
                                    ? "Mostrar fecha"
                                    : "Ver reservas del día"}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.rightFlipContainer}>
                            <Animated.View
                                pointerEvents={showDayReservations ? "none" : "auto"}
                                style={[styles.flipFace, styles.flipFrontFace, frontFaceAnimatedStyle]}
                            >
                                <Animated.View style={[styles.dateMainContent, dateMainContentAnimatedStyle]}>
                                    <Text style={[styles.dateMonth, { fontSize: dateMonthSize }]}>{monthName}</Text>
                                    <Text
                                        style={[
                                            styles.dateNumber,
                                            {
                                                fontSize: dateNumberSize,
                                                lineHeight: Math.floor(dateNumberSize * 0.92),
                                            },
                                        ]}
                                    >
                                        {dayNumber}
                                    </Text>
                                    <Text style={[styles.dateDay, { fontSize: dateDaySize }]}>{dayName}</Text>
                                </Animated.View>
                                {showReservedMessage ? (
                                    <Animated.Text
                                        style={[
                                            styles.dateReservedMessage,
                                            { fontSize: dateReservedSize },
                                            reservedMessageAnimatedStyle,
                                        ]}
                                    >
                                        Ya está reservado
                                    </Animated.Text>
                                ) : null}
                            </Animated.View>

                            <Animated.View
                                pointerEvents={showDayReservations ? "auto" : "none"}
                                style={[styles.flipFace, styles.flipBackFace, backFaceAnimatedStyle]}
                            >
                                <Text style={styles.dayReservationsTitle}>Reservas del día</Text>
                                <Text style={styles.dayReservationsDate}>
                                    {displayedDate.format("dddd D [de] MMMM")}
                                </Text>
                                <ScrollView
                                    ref={reservationsScrollRef}
                                    style={styles.dayReservationsScroll}
                                    contentContainerStyle={styles.dayReservationsScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {selectedDayEvents.length > 0 ? (
                                        selectedDayEvents.map((ev, idx) => {
                                            const itemKey = getReservationKey(ev, idx);
                                            if (!reservationItemAnimsRef.current[itemKey]) {
                                                reservationItemAnimsRef.current[itemKey] = new Animated.Value(0);
                                            }
                                            const itemAnim = reservationItemAnimsRef.current[itemKey];
                                            const isConflicting = conflictingReservationKeys.includes(itemKey);
                                            const animatedStyle = {
                                                transform: [
                                                    {
                                                        translateY: itemAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [0, -10],
                                                        }),
                                                    },
                                                    {
                                                        scale: itemAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [1, 1.03],
                                                        }),
                                                    },
                                                ],
                                            };
                                            return (
                                            <Animated.View
                                                key={itemKey}
                                                onLayout={(e) => {
                                                    reservationItemLayoutsRef.current[itemKey] = {
                                                        y: e.nativeEvent.layout.y,
                                                        height: e.nativeEvent.layout.height,
                                                    };
                                                    if (
                                                        showDayReservations &&
                                                        pendingConflictScrollKeyRef.current === itemKey &&
                                                        reservationsScrollRef.current
                                                    ) {
                                                        reservationsScrollRef.current.scrollTo({
                                                            y: Math.max(e.nativeEvent.layout.y - 12, 0),
                                                            animated: true,
                                                        });
                                                        pendingConflictScrollKeyRef.current = null;
                                                    }
                                                }}
                                                style={[
                                                    styles.dayReservationItem,
                                                    isConflicting && styles.dayReservationItemConflict,
                                                    animatedStyle,
                                                ]}
                                            >
                                                <Text style={styles.dayReservationTitle} numberOfLines={2}>
                                                    {ev.title}
                                                </Text>
                                                <Text style={styles.dayReservationTime}>
                                                    {dayjs(ev.start).format("HH:mm")} - {dayjs(ev.end).format("HH:mm")}
                                                </Text>
                                            </Animated.View>
                                        )})
                                    ) : (
                                        <Text style={styles.dayReservationsEmpty}>Sin reservas para este día</Text>
                                    )}
                                </ScrollView>
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalContainer: {
        width: "90%",
        maxWidth: 980,
        minHeight: 460,
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    modalTitle: {
        color: "#111111",
        fontSize: 34,
        fontWeight: "700",
        marginBottom: 16,
    },
    label: {
        color: "#4E4E4E",
        marginBottom: 8,
        marginTop: 10,
        fontSize: 16,
        fontWeight: "500",
    },
    validationMessage: {
        marginTop: 12,
        marginBottom: 4,
        fontSize: 13,
        textAlign: "left",
    },
    input: {
        backgroundColor: "#FFFFFF",
        color: "#111111",
        borderWidth: 1,
        borderColor: "#DADADA",
        borderRadius: 8,
        padding: 12,
    },
    pickerCard: {
        width: "100%",
        backgroundColor: "#F5FBF9",
        borderWidth: 1,
        borderColor: "#DBEBE5",
        borderRadius: 12,
        padding: 12,
        marginBottom: 4,
    },
    timeGroupsRow: {
        flexDirection: "row",
        marginTop: 12,
        gap: 10,
    },
    timeGroupsRowStacked: {
        flexDirection: "column",
    },
    timeGroup: {
        flex: 1,
    },
    dateInputWrap: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 46,
        paddingHorizontal: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CFE0DA",
        borderRadius: 10,
    },
    dateInputOverlayText: {
        flex: 1,
        color: "#1A1A1A",
        fontSize: 15,
        fontWeight: "500",
        pointerEvents: "none",
    },
    dateInputIcon: {
        color: "#4C655D",
        fontSize: 16,
        marginLeft: 8,
        pointerEvents: "none",
    },
    dateInputPlaceholderText: {
        color: "#8A8A8A",
        fontWeight: "400",
    },
    timeGroupLabel: {
        color: "#5A6A65",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
    },
    webTimeRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        minWidth: 0,
        gap: 8,
    },
    timeSeparator: {
        color: "#3F4F4A",
        fontSize: 18,
        fontWeight: "700",
        marginHorizontal: 2,
    },
    formColumn: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingVertical: 28,
        paddingHorizontal: 28,
        justifyContent: "center",
    },
    dateColumn: {
        width: 310,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
    },
    dateMainContent: {
        alignItems: "center",
        justifyContent: "center",
    },
    rightFlipContainer: {
        width: "100%",
        height: "100%",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    flipFace: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: "center",
        justifyContent: "center",
        backfaceVisibility: "hidden",
    },
    flipFrontFace: {
        zIndex: 2,
    },
    flipBackFace: {
        zIndex: 1,
        paddingTop: 72,
        paddingHorizontal: 12,
        paddingBottom: 18,
        alignItems: "stretch",
        justifyContent: "flex-start",
    },
    dateMonth: {
        color: "#FFFFFF",
        fontSize: 36,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    dateNumber: {
        color: "#FFFFFF",
        fontSize: 180,
        lineHeight: 165,
        fontWeight: "700",
        includeFontPadding: false,
        marginVertical: 10,
    },
    dateDay: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    dateReservedMessage: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 44,
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "600",
        textAlign: "center",
    },
    dayReservationsTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
    },
    dayReservationsDate: {
        marginTop: 6,
        marginBottom: 12,
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        textTransform: "capitalize",
    },
    dayReservationsScroll: {
        width: "100%",
        flex: 1,
    },
    dayReservationsScrollContent: {
        flexGrow: 1,
        paddingBottom: 14,
    },
    dayReservationItem: {
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.20)",
    },
    dayReservationItemConflict: {
        backgroundColor: "rgba(255,255,255,0.38)",
    },
    dayReservationTitle: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    dayReservationTime: {
        marginTop: 2,
        color: "#FFFFFF",
        fontSize: 15,
        opacity: 0.95,
    },
    dayReservationsEmpty: {
        color: "#FFFFFF",
        fontSize: 16,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 14,
        opacity: 0.95,
    },
    viewReservationsButtonRight: {
        position: "absolute",
        top: 14,
        alignSelf: "center",
        zIndex: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
        backgroundColor: "rgba(255,255,255,0.25)",
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    viewReservationsText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: fonts.family.semibold,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    secondaryButton: {
        backgroundColor: "#F3F3F3",
        borderWidth: 1,
        borderColor: "#D3D3D3",
    },
    secondaryButtonText: {
        color: "#3A3A3A",
        fontWeight: "700",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
