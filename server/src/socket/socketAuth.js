import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { env } from "../config/env.js";

const getCookieValue = (cookieHeader = "", name) => {
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) return null;

  return decodeURIComponent(targetCookie.split("=")[1]);
};

export const socketAuth = async (socket, next) => {
  try {
    const tokenFromCookie = getCookieValue(
      socket.handshake.headers.cookie || "",
      "accessToken"
    );

    const tokenFromAuth = socket.handshake.auth?.token;

    const token =
      tokenFromCookie ||
      tokenFromAuth ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Unauthorized socket connection"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return next(new Error("Unauthorized socket connection"));
    }

    socket.user = user.toSafeObject();

    next();
  } catch (error) {
    next(new Error("Unauthorized socket connection"));
  }
};