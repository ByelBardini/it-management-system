import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");

      err.userMessage = "Sua sessão expirou. Faça login novamente.";
    } else if (status >= 500) {
      err.userMessage = "Erro no servidor. Tente novamente mais tarde.";
    }

    return Promise.reject(err);
  }
);
