import api from "./axiosInstance";

export const taskApi = {
  getAll: (params = {}) => api.get("/tasks", { params }),
  getGrouped: () => api.get("/tasks/grouped-by-category"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),

  exportCsv: (params = {}) =>
    api.get("/tasks/export", {
      params,
      responseType: "blob",
    }),

  importCsv: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/tasks/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (id, data) => api.patch(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};