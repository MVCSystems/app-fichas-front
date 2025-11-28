import { siteConfig } from "@/config";
import axios, { AxiosError } from "axios";

// Cliente axios simplificado: cookie-first
const api = axios.create({
  baseURL: siteConfig.backend_url,
  withCredentials: true, // enviar cookies (accessToken httpOnly, sessionid, csrftoken)
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: leer cookie por nombre (client-side)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Añadir header CSRF automáticamente en métodos que lo requieran
api.interceptors.request.use((config) => {
  try {
    const method = (config.method || '').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrf = getCookie('csrftoken');
      if (csrf) {
        (config.headers as Record<string, string>)['X-CSRFToken'] = csrf;
      }
    }
  } catch (e) {
    // no bloquear la petición por errores de lectura de cookies
    // console.warn('Error leyendo cookie CSRF:', e)
  }
  return config;
}, (error: AxiosError) => Promise.reject(error));

// Respuesta: si 401, redirigir a login
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export { api, fetcher };
export default api;