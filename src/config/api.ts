// Configuración centralizada de la API

// 🌍 URL de Producción (Servidor Contabo)
export const PROD_API_URL = "https://rooms.reinventedschools.com/api";

// 🏠 URL Local (Tu PC)
// Para tablet/Expo Go en la misma red: usa la IP de tu PC (192.168.70.100)
// Para navegador: puedes usar localhost si prefieres
export const LOCAL_API_URL = "http://192.168.70.100:5130/api";

// 🎛️ CONFIGURACIÓN DE ENTORNO
// Pon esto en 'true' SOLO si tienes el backend .NET corriendo en tu propia PC.
// Pon esto en 'false' para producción (usa el servidor de Contabo).
const USE_LOCAL_BACKEND = false;

// Helper para obtener la URL base
export const getApiUrl = () => {
  // Si forzamos local, devolvemos local
  if (USE_LOCAL_BACKEND) {
    return LOCAL_API_URL;
  }

  // Por defecto, usamos Producción (incluso si estás probando desde tu casa)
  return PROD_API_URL;
};
