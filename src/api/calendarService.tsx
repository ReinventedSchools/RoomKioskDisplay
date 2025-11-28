import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


// 🚀 FORZAR la IP del servidor en producción
export const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5130/api"
        : "http://109.123.245.32:8080";

console.log("🌐 API_BASE:", API_BASE);


/**
 * 📅 Obtener los eventos de una sala específica
 */
export async function getRoomEvents(tenant: string, roomEmail: string) {
    try {
        const encodedEmail = encodeURIComponent(roomEmail);
        const url = `${API_BASE}/calendar/${tenant}/${encodedEmail}`;
        console.log("➡️ Solicitando:", url);

        const response = await axios.get<any[]>(url);
        const data = response.data || [];

        // 🧩 Normalizamos los datos para el frontend
        const formatted = data.map((ev: any) => {
            const startISO = ev.start?.dateTime
                ? ev.start.dateTime.split(".")[0]
                : ev.start;
            const endISO = ev.end?.dateTime
                ? ev.end.dateTime.split(".")[0]
                : ev.end;

            return {
                id: ev.id || Math.random().toString(),
                title: ev.subject || ev.organizer?.emailAddress?.name || "Sin título",
                start: startISO,
                end: endISO,
                organizer: ev.organizer?.emailAddress?.name || "",
                people: ev.attendees?.length || 0,
            };
        });

        // 🕓 Filtramos solo los eventos del día actual
        const today = dayjs().startOf("day");
        const tomorrow = today.add(1, "day");

        const todayEvents = formatted.filter((e) => {
            const start = dayjs(e.start);
            const end = dayjs(e.end);
            return (
                (start.isSameOrAfter(today) && start.isBefore(tomorrow)) ||
                (end.isAfter(today) && end.isSameOrBefore(tomorrow))
            );
        });

        console.log("📦 Eventos cargados (hoy):", todayEvents.length);
        todayEvents.forEach((ev) =>
            console.log("🕓", ev.title, ev.start, "-", ev.end)
        );

        return todayEvents;
    } catch (error: any) {
        console.error("❌ Error al obtener eventos:", error.message);
        return [];
    }
}
