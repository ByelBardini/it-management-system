import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // Envia o cookie httpOnly de sessão em toda requisição (mesma origem via /api).
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, code, message } = error.response.data;
      return Promise.reject({ status, code, message });
    } else if (error.request) {
      return Promise.reject({
        status: 503,
        code: "ERR_NO_RESPONSE",
        message: "Servidor não respondeu",
      });
    } else {
      return Promise.reject({
        status: 500,
        code: "ERR_AXIOS",
        message: error.message,
      });
    }
  }
);
