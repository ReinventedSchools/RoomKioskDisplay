import axios from "axios";
import dayjs from "dayjs";

import { getApiUrl } from "@src/config/api";

const API_BASE = getApiUrl();

export { API_BASE };

function extractEventsArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeEvents(data: any[]) {
  return data.map((ev: any) => {
    const startISO = ev.start?.dateTime
      ? ev.start.dateTime.split(".")[0]
      : ev.start;
    const endISO = ev.end?.dateTime ? ev.end.dateTime.split(".")[0] : ev.end;

    return {
      id: ev.id || Math.random().toString(),
      title: ev.subject || ev.organizer?.emailAddress?.name || "Sin título",
      start: startISO,
      end: endISO,
      organizer: ev.organizer?.emailAddress?.name || "",
      people: ev.attendees?.length || 0,
    };
  });
}

/**
 * 📅 Obtener los eventos de una sala específica
 */
export async function getRoomEvents(
  tenant: string,
  roomEmail: string,
  rangeStart?: string,
  rangeEnd?: string,
) {
  try {
    const encodedEmail = encodeURIComponent(roomEmail);
    const baseUrl = `${API_BASE}/calendar/${tenant}/${encodedEmail}`;
    const queryStart =
      rangeStart || dayjs().startOf("month").format("YYYY-MM-DD");
    const queryEnd =
      rangeEnd || dayjs().endOf("month").format("YYYY-MM-DD");
    const url = `${baseUrl}?startDate=${queryStart}&endDate=${queryEnd}`;
    console.log("➡️ Solicitando:", url);
    const response = await axios.get<any>(url);
    const rawEvents = extractEventsArray(response.data || []);
    const formatted = normalizeEvents(rawEvents);

    // ✅ Devolvemos todos los eventos para que el frontend pueda filtrar por día seleccionado.
    console.log("📦 Eventos cargados (total):", formatted.length);
    formatted.forEach((ev) =>
      console.log("🕓", ev.title, ev.start, "-", ev.end),
    );

    return formatted;
  } catch (error: any) {
    console.error("❌ Error al obtener eventos:", error.message);
    if (error?.response?.status === 404) {
      return [];
    }
    return [];
  }
}
