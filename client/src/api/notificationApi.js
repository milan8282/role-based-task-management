import api from "./axiosInstance";

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
  remove: (id) => api.delete(`/notifications/${id}`)
};