// Configuración centralizada de la API

// 🌍 URL de Producción (Servidor Contabo)
export const PROD_API_URL = "https://rooms.reinventedschools.com/api";

// 🏠 URL Local (Tu PC)
export const LOCAL_API_URL = "http://localhost:5130/api";

// 🎛️ CONFIGURACIÓN DE ENTORNO
// Pon esto en 'true' SOLO si tienes el backend .NET corriendo en tu propia PC.
// Pon esto en 'false' para usar siempre el servidor de Contabo (recomendado para pruebas ahora).
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
