import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    FlatList,
    ActivityIndicator,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import colors from "@/config/colors";
import fonts from "@/config/fonts";
import images from "@/config/images";
import ClockDisplay from "@/components/ClockDisplay";
import { getRoomEvents } from "@/api/calendarService";
import TimelineItem from "@/components/TimelineItem";
import { Pressable } from "react-native";

type PickerMode = "start" | "end" | null;

export default function RoomScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(dayjs());

    // Modal + formulario
    const [showModal, setShowModal] = useState(false);
    const [pickerMode, setPickerMode] = useState<PickerMode>(null);
    const [form, setForm] = useState({
        subject: "",
        start: "",
        end: "",
    });

    const flatListRef = useRef<FlatList>(null);

    const roomName = "Sala Creativity";
    const tenant = "TenantA";
    const roomEmail = "creativity@reinventedpuembo.edu.ec";
    const API_BASE = "http://192.168.1.66:5130"; // 🔧 Cambia aquí tu backend si lo necesitas

    // 🕒 Actualiza la hora cada minuto
    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 🔄 Cargar eventos desde el backend
    const loadEvents = async (showLoader: boolean = false) => {
        if (showLoader) setLoading(true);

        try {
            const data = await getRoomEvents(tenant, roomEmail);
            console.log("📦 Eventos cargados:", data);
            setEvents(data);
        } catch (error) {
            console.error("❌ Error cargando eventos:", error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("🔄 Actualizando eventos automáticamente...");
            loadEvents(false);
        }, 10000); // cada 30 segundos
        return () => clearInterval(interval); // limpiar al desmontar
    }, []);

    // 🧠 Detecta si hay un evento activo actualmente
    useEffect(() => {
        const active = events.find(
            (ev) => now.isAfter(dayjs(ev.start)) && now.isBefore(dayjs(ev.end))
        );
        setCurrentEvent(active || null);
    }, [now, events]);

    // 🕓 Genera las horas del día (07:00–18:00)
    const hours = Array.from({ length: 12 }, (_, i) => 7 + i);

    // 🧩 Crea los bloques del timeline con múltiples eventos
    const timelineData = hours.map((h) => {
        const hourLabel = `${String(h).padStart(2, "0")}:00`;

        const hourEvents = events.filter((e) => {
            const start = dayjs(e.start);
            const end = dayjs(e.end);
            return (
                (start.hour() <= h && end.hour() > h) ||
                (start.hour() === h && start.minute() < 59)
            );
        });

        const isActive = hourEvents.some(
            (ev) => now.isAfter(dayjs(ev.start)) && now.isBefore(dayjs(ev.end))
        );

        return {
            hour: hourLabel,
            events: hourEvents.map((ev) => ({
                title: ev.title,
                organizer: ev.organizer,
                start: dayjs(ev.start).format("HH:mm"),
                end: dayjs(ev.end).format("HH:mm"),
            })),
            isActive,
        };
    });

    // 🎯 Scroll automático al bloque horario actual (centrado)
    useEffect(() => {
        const currentHour = now.hour();
        const indexToScroll = hours.findIndex((h) => h === currentHour);
        if (indexToScroll >= 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: indexToScroll,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 400);
        }
    }, [timelineData]);

    // 📝 Manejo del formulario
    const setField = (key: keyof typeof form, value: string) =>
        setForm((f) => ({ ...f, [key]: value }));

    // 🚀 Crear reserva

    const handleReserve = async () => {
        console.log("🔥 handleReserve llamado");

        if (!form.subject|| !form.start || !form.end) {
            Alert.alert("Faltan datos", "Completa nombre, hora de inicio y  hora de finalización.");
            return;
        }
        try {
            const body = {
                subject: form.subject || `Reserva de ${form.subject}`,
                start: dayjs(form.start).format("YYYY-MM-DDTHH:mm:ss"),
                end: dayjs(form.end).format("YYYY-MM-DDTHH:mm:ss")
            };
            console.log("📤 Enviando datos de reserva:", body);

            const resp = await fetch(`${API_BASE}/api/calendar/TenantA/creativity@reinventedpuembo.edu.ec`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            console.log("📡 Status:", resp.status);
            if (!resp.ok) throw new Error(await resp.text());
            let result = null;
            try {
                const text = await resp.text();
                result = text ? JSON.parse(text) : null;
            } catch {
                result = null; // si no hay json no pasa nada
            }

            console.log("📨 Respuesta del servidor:", result);

            Alert.alert("Éxito", "Reserva creada correctamente ✅");
            setShowModal(false);
            setForm({ subject: "", start: "", end: "" });
            loadEvents();
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "No se pudo crear la reserva.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={{ color: colors.text, marginTop: 10 }}>
                    Cargando calendario...
                </Text>
            </View>
        );
    }

    return (
        <ImageBackground source={images.backgrounds.creativity} style={styles.background}>
            <View style={styles.overlay}>
                {/* IZQUIERDA */}
                <View style={styles.left}>
                    <Text style={styles.roomName}>{roomName}</Text>

                    {currentEvent ? (
                        <>
                            <Text style={styles.host}>{currentEvent.title}</Text>
                            <Text style={styles.time}>
                                {dayjs(currentEvent.start).format("HH:mm")} -{" "}
                                {dayjs(currentEvent.end).format("HH:mm")}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.host}>Disponible</Text>
                    )}

                    <Text style={styles.date}>{dayjs().format("DD MMM")}</Text>
                    <ClockDisplay />
                </View>

                {/* DERECHA */}
                <View style={styles.right}>
                    <FlatList
                        ref={flatListRef}
                        data={timelineData}
                        keyExtractor={(item) => item.hour}
                        renderItem={({ item }) => (
                            <TimelineItem
                                hour={item.hour}
                                events={item.events}
                                isActive={item.isActive}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        getItemLayout={(data, index) => ({
                            length: 80,
                            offset: 80 * index,
                            index,
                        })}
                    />
                </View>
            </View>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
                <Ionicons name="calendar-outline" size={28} color="white" />
            </TouchableOpacity>

            {/* MODAL */}
            <Modal animationType="slide" transparent visible={showModal} onRequestClose={() => setShowModal(false)}>


                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Nueva Reserva</Text>

                        <Text style={styles.label}>Organizador</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu nombre"
                            placeholderTextColor="#888"
                            value={form.subject}
                            onChangeText={(t) => setField("subject", t)}
                        />

                        {Platform.OS === "web" ? (
                            <>
                                <Text style={styles.label}>Inicio</Text>
                                <View style={styles.input}>
                                    <input
                                        type="datetime-local"
                                        style={{
                                            backgroundColor: "transparent",
                                            color: "white",
                                            border: "none",
                                            width: "100%",
                                            outline: "none",
                                        }}
                                        value={form.start ? dayjs(form.start).format("YYYY-MM-DDTHH:mm") : ""}
                                        onChange={(e) => setField("start", dayjs(e.target.value).toISOString())}
                                    />
                                </View>

                                <Text style={styles.label}>Fin</Text>
                                <View style={styles.input}>
                                    <input
                                        type="datetime-local"
                                        style={{
                                            backgroundColor: "transparent",
                                            color: "white",
                                            border: "none",
                                            width: "100%",
                                            outline: "none",
                                        }}
                                        value={form.end ? dayjs(form.end).format("YYYY-MM-DDTHH:mm") : ""}
                                        onChange={(e) => setField("end", dayjs(e.target.value).toISOString())}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Inicio</Text>
                                <TouchableOpacity style={styles.input} onPress={() => setPickerMode("start")}>
                                    <Text style={{ color: form.start ? "#fff" : "#888" }}>
                                        {form.start ? dayjs(form.start).format("DD/MM/YYYY HH:mm") : "Selecciona fecha y hora"}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.label}>Fin</Text>
                                <TouchableOpacity style={styles.input} onPress={() => setPickerMode("end")}>
                                    <Text style={{ color: form.end ? "#fff" : "#888" }}>
                                        {form.end ? dayjs(form.end).format("DD/MM/YYYY HH:mm") : "Selecciona fecha y hora"}
                                    </Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={pickerMode !== null}
                                    mode="datetime"
                                    onConfirm={(date) => {
                                        const iso = dayjs(date).toISOString();
                                        if (pickerMode === "start") setField("start", iso);
                                        if (pickerMode === "end") setField("end", iso);
                                        setPickerMode(null);
                                    }}
                                    onCancel={() => setPickerMode(null)}
                                />
                            </>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: "#444" }]} onPress={() => setShowModal(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={() => {
                                console.log("🔥 CLICK EN BOTÓN");
                                handleReserve();
                            }}>
                                <Text style={styles.buttonText}>Reservar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    left: { flex: 2, justifyContent: "center", paddingLeft: 20 },
    right: { flex: 1, justifyContent: "center", paddingLeft: 20 },
    roomName: { fontSize: fonts.title, color: colors.text, fontFamily: fonts.family.bold },
    host: { fontSize: fonts.subtitle, color: colors.text, marginVertical: 5 },
    time: { fontSize: fonts.text, color: colors.accent },
    date: { position: "absolute", bottom: 80, left: 20, fontSize: fonts.text, color: colors.text },
    fab: { position: "absolute", bottom: 30, right: 30, backgroundColor: colors.accent, borderRadius: 50, padding: 16, elevation: 5 },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" },
    modalContainer: { width: "90%", backgroundColor: "#222", padding: 20, borderRadius: 12 },
    modalTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 15 },
    label: { color: "#aaa", marginBottom: 5, marginTop: 10 },
    input: { backgroundColor: "#333", color: "#fff", borderRadius: 8, padding: 12 },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    button: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold" },
});
