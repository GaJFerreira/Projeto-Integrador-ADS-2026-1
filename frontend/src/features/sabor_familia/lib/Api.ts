import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/sabor-familia",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  if (config.responseType === "blob" || config.responseType === "arraybuffer") {
    delete config.headers["Content-Type"];
    config.headers.Accept = "image/*,*/*";
  }
  return config;
});

export default api;
