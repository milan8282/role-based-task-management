let ioInstance = null;

export const setSocketInstance = (io) => {
  ioInstance = io;
};

export const getSocketInstance = () => {
  return ioInstance;
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;

  ioInstance.to(`user:${userId}`).emit(event, payload);
};

export const emitToUsers = (userIds = [], event, payload) => {
  if (!ioInstance || !Array.isArray(userIds)) return;

  userIds.forEach((userId) => {
    emitToUser(userId, event, payload);
  });
};

export const emitToTask = (taskId, event, payload) => {
  if (!ioInstance || !taskId) return;

  ioInstance.to(`task:${taskId}`).emit(event, payload);
};