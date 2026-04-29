import api from "./axiosInstance";

export const deviceTokenApi = {
  save: (data) => api.post("/device-tokens", data),
  remove: (token) => api.delete("/device-tokens", { data: { token } })
};