import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";
import { socketAuth } from "./socketAuth.js";
import { setSocketInstance } from "../services/socket.service.js";
import { registerTaskSocketHandlers } from "./task.socket.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);

    socket.join(`user:${userId}`);

    socket.emit("socket:connected", {
      message: "Socket connected successfully",
      user: socket.user,
    });

    registerTaskSocketHandlers(socket);

    socket.on("disconnect", () => {});
  });

  setSocketInstance(io);

  return io;
};