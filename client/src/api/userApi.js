import api from "./axiosInstance";

export const userApi = {
  getAll: () => api.get("/users"),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive })
};