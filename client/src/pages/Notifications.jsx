import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "../context/NotificationContext";
import NotificationPermission from "../components/notifications/NotificationPermission";

export default function Notifications() {
  const { notifications, markRead, markAllRead, removeNotification } =
    useNotifications();

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
            Live notification center
          </p>

          <h1 className="text-4xl font-medium tracking-[-0.9px]">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-[#8a8f98]">
            Task assignment, comments, status changes and reminders.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <CheckCheck size={17} />
          Mark all read
        </button>
      </div>

      <NotificationPermission />

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`glass-card rounded-2xl p-4 ${
              !notification.isRead ? "border-[#7170ff]/40" : ""
            }`}
          >
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#828fff]">
                <Bell size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="font-medium text-[#f7f8f8]">
                      {notification.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#8a8f98]">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-[#62666d]">
                      {format(new Date(notification.createdAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-start gap-2">
                    {!notification.isRead ? (
                      <button
                        onClick={() => markRead(notification._id)}
                        className="btn-ghost h-fit text-xs"
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="h-fit rounded-full border border-white/[0.08] px-3 py-2 text-xs text-[#62666d]">
                        Read
                      </span>
                    )}

                    <button
                      onClick={() => removeNotification(notification._id)}
                      className="btn-ghost h-fit px-3 py-2 text-red-300"
                      title="Remove notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center text-[#8a8f98]">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}