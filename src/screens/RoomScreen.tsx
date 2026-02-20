import colors from "@config/colors";
import fonts from "@config/fonts";
import { getRoomEvents } from "@src/api/calendarService";
import DayPanel from "@src/components/DayPanel";
import MonthCalendar from "@src/components/MonthCalendar";
import ReservationModal from "@src/components/ReservationModal";
import RoomLayout from "@src/components/RoomLayout";
import { getApiUrl } from "@src/config/api";
import { roomsConfig } from "@src/config/roomsConfig";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
} from "react-native";

type PickerMode = "start" | "end" | null;

const API_BASE = getApiUrl();

export default function RoomScreen() {
  const router = useRouter();
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

  const { id } = useLocalSearchParams(); // id que viene desde la URL
  const room = roomsConfig[id as keyof typeof roomsConfig]; // datos según la sala seleccionada

  const roomName = room.name;
  const roomEmail = room.email;
  const theme = room.theme;
  const roomBackground = room.background;
  const tenant = room.tenant; // puedes moverlo a la config si cambia por sala

  console.log("🟦 PARAMS:", id);
  console.log("🟨 room encontrado:", room);

  console.log("🟩 tenant:", tenant);
  console.log("🟧 roomEmail:", roomEmail);

  // 🕒 Actualiza la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 🔄 Cargar eventos desde el backend
  const loadEvents = async (showLoader: boolean = false) => {
    console.log("🔵 loadEvents llamado");
    console.log("🔸 tenant:", tenant);
    console.log("🔸 roomEmail:", roomEmail);
    if (showLoader) setLoading(true);

    try {
      console.log(
        "📡 Llamando a GET:",
        `${API_BASE}/api/calendar/${tenant}/${roomEmail}`,
      );
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
    if (roomEmail && tenant) {
      loadEvents(true);
    }
  }, [roomEmail, tenant]);

  useEffect(() => {
    if (!roomEmail || !tenant) return;

    const interval = setInterval(() => {
      loadEvents(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [roomEmail, tenant]);

  // 🧠 Detecta si hay un evento activo actualmente
  useEffect(() => {
    const active = events.find(
      (ev) => now.isAfter(dayjs(ev.start)) && now.isBefore(dayjs(ev.end)),
    );
    setCurrentEvent(active || null);
  }, [now, events]);


  // 📝 Manejo del formulario
  const setField = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ✅ Verifica si el rango de horas se solapa con algún evento existente
  const hasTimeConflict = (
    newStart: string,
    newEnd: string,
    existingEvents: any[],
  ): { conflict: boolean; conflictingEvent?: any } => {
    const start = dayjs(newStart);
    const end = dayjs(newEnd);

    for (const ev of existingEvents) {
      const evStart = dayjs(ev.start);
      const evEnd = dayjs(ev.end);
      // Solapamiento: el nuevo rango se cruza si start < evEnd Y end > evStart
      if (start.isBefore(evEnd) && end.isAfter(evStart)) {
        return { conflict: true, conflictingEvent: ev };
      }
    }
    return { conflict: false };
  };

  // 📋 Mensaje de validación para mostrar debajo de los horarios
  const getValidationMessage = (): { message: string; isError: boolean } => {
    if (!form.start || !form.end) return { message: "", isError: false };
    const newStart = dayjs(form.start);
    const newEnd = dayjs(form.end);
    if (!newEnd.isAfter(newStart)) {
      return {
        message: "La hora de fin debe ser posterior a la de inicio.",
        isError: true,
      };
    }
    const { conflict, conflictingEvent } = hasTimeConflict(
      form.start,
      form.end,
      events,
    );
    if (conflict && conflictingEvent) {
      return {
        message: `Este horario ya está reservado (${conflictingEvent.title}, ${dayjs(conflictingEvent.start).format("HH:mm")} - ${dayjs(conflictingEvent.end).format("HH:mm")}). Selecciona otro horario disponible.`,
        isError: true,
      };
    }
    if (conflict) {
      return {
        message: "Este horario ya está reservado. Selecciona otro horario disponible.",
        isError: true,
      };
    }
    return { message: "Horario disponible ✓", isError: false };
  };

  const validation = getValidationMessage();

  // 🚀 Crear reserva
  const handleReserve = async () => {
    console.log("🔥 handleReserve llamado");

    if (!form.subject || !form.start || !form.end) {
      Alert.alert(
        "Faltan datos",
        "Completa nombre, hora de inicio y hora de finalización.",
      );
      return;
    }

    const newStart = dayjs(form.start);
    const newEnd = dayjs(form.end);
    if (!newEnd.isAfter(newStart)) {
      Alert.alert(
        "Hora inválida",
        "La hora de fin debe ser posterior a la hora de inicio.",
      );
      return;
    }

    const { conflict, conflictingEvent } = hasTimeConflict(
      form.start,
      form.end,
      events,
    );
    if (conflict) {
      const msg = conflictingEvent
        ? `Este horario ya está reservado (${conflictingEvent.title}, ${dayjs(conflictingEvent.start).format("HH:mm")} - ${dayjs(conflictingEvent.end).format("HH:mm")}). Selecciona otro horario disponible.`
        : "Este horario ya está reservado. Selecciona otro horario disponible.";
      Alert.alert("Horario no disponible", msg);
      return;
    }

    try {
      const body = {
        subject: form.subject || `Reserva de ${form.subject}`,
        start: dayjs(form.start).format("YYYY-MM-DDTHH:mm:ss"),
        end: dayjs(form.end).format("YYYY-MM-DDTHH:mm:ss"),
      };
      console.log("📤 Enviando datos de reserva:", body);

      const resp = await fetch(
        `${API_BASE}/calendar/${tenant}/${roomEmail}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

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
      <View style={[styles.loader, { backgroundColor: theme.secondary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Cargando calendario...
        </Text>
      </View>
    );
  }

  return (
    <RoomLayout background={roomBackground}>
      <DayPanel
        roomName={roomName}
        events={events}
        currentEvent={currentEvent}
        now={now}
        theme={theme}
        onLogoPress={() => router.replace("/")}
        onCreateReservation={() => setShowModal(true)}
      />
      <MonthCalendar events={events} now={now} theme={theme} />

      {/* MODAL */}
      <ReservationModal
        visible={showModal}
        form={form}
        pickerMode={pickerMode}
        setPickerMode={setPickerMode}
        onClose={() => setShowModal(false)}
        onChange={setField}
        onSubmit={handleReserve}
        theme={theme}
        validationMessage={validation.message}
        validationIsError={validation.isError}
      />
    </RoomLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 0,
  },
  logo: {
    width: 180,
    height: 70,
    resizeMode: "contain",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  roomName: {
    fontSize: fonts.title,
    color: colors.text,
    fontFamily: fonts.family.bold,
  },
  host: {
    fontSize: fonts.subtitle,
    color: colors.text,
    marginVertical: 5,
    fontFamily: fonts.family.light,
  },
  time: { fontSize: fonts.text, color: colors.accent },
  date: {
    position: "absolute",
    bottom: 110,
    left: 20,
    fontSize: fonts.date,
    color: colors.text,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: colors.secondary,
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: { color: "#aaa", marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
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
  buttonText: { color: "#fff", fontWeight: "bold" },
});
