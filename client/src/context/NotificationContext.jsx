import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notificationApi } from "../api/notificationApi";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { listenForegroundMessages } from "../config/firebase";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    if (!user) return;

    const res = await notificationApi.getAll();
    setNotifications(res.data.data.notifications);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", ({ notification }) => {
      setNotifications((prev) => {
        if (prev.some((item) => item._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      toast(notification.title);
    });

    socket.on("notification:read", ({ notification }) => {
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? notification : item))
      );
    });

    socket.on("notification:all-read", () => {
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
    });

    socket.on("notification:deleted", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.filter((item) => item._id !== notificationId)
      );
    });

    return () => {
      socket.off("notification:new");
      socket.off("notification:read");
      socket.off("notification:all-read");
      socket.off("notification:deleted");
    };
  }, [socket]);

  useEffect(() => {
    let unsubscribe = null;

    const setupForegroundMessages = async () => {
      unsubscribe = await listenForegroundMessages((payload) => {
        const title = payload?.notification?.title || "New notification";
        const body = payload?.notification?.body || "";

        toast(`${title}${body ? ` - ${body}` : ""}`);
      });
    };

    if (user) setupForegroundMessages();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user]);

  const markRead = async (id) => {
    await notificationApi.markRead(id);
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
  };

  const removeNotification = async (id) => {
    await notificationApi.remove(id);
    toast.success("Notification removed");
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadNotifications,
        markRead,
        markAllRead,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);