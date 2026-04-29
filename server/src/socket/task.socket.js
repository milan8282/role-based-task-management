import Task from "../models/Task.model.js";

const canJoinTaskRoom = (task, user) => {
  if (user.role === "admin") return true;

  const userId = String(user._id);

  const isCreator = String(task.createdBy) === userId;

  const isAssigned = task.assignedTo?.some(
    (assignedUserId) => String(assignedUserId) === userId
  );

  return isCreator || isAssigned;
};

export const registerTaskSocketHandlers = (socket) => {
  socket.on("task:join", async ({ taskId }) => {
    try {
      if (!taskId) return;

      const task = await Task.findById(taskId);

      if (!task) return;

      if (!canJoinTaskRoom(task, socket.user)) return;

      socket.join(`task:${taskId}`);

      socket.emit("task:joined", {
        taskId,
      });
    } catch (error) {
      socket.emit("socket:error", {
        message: "Unable to join task room",
      });
    }
  });

  socket.on("task:leave", ({ taskId }) => {
    if (!taskId) return;

    socket.leave(`task:${taskId}`);

    socket.emit("task:left", {
      taskId,
    });
  });
};