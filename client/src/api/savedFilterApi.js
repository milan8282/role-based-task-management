import api from "./axiosInstance";

export const savedFilterApi = {
  getAll: () => api.get("/saved-filters"),
  create: (data) => api.post("/saved-filters", data),
  remove: (id) => api.delete(`/saved-filters/${id}`),
};