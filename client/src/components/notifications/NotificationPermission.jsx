import { useEffect, useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { deviceTokenApi } from "../../api/deviceTokenApi";
import { requestFirebaseToken } from "../../config/firebase";

export default function NotificationPermission() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setEnabled(Boolean(localStorage.getItem("fcmTokenSaved")));
    }
  }, []);

  const enableNotifications = async () => {
    if (enabled) {
      toast.success("Push notifications are already enabled");
      return;
    }

    setLoading(true);

    try {
      const token = await requestFirebaseToken();

      if (!token) {
        toast.error("Notification permission was not granted");
        return;
      }

      await deviceTokenApi.save({
        token,
        platform: "web",
        browser: navigator.userAgent.slice(0, 500)
      });

      localStorage.setItem("fcmTokenSaved", "true");
      localStorage.setItem("fcmToken", token);

      setEnabled(true);
      toast.success("Push notifications enabled");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to enable notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card mb-5 rounded-2xl p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#828fff]">
            {enabled ? <CheckCircle2 size={20} /> : <BellRing size={20} />}
          </div>

          <div>
            <h3 className="font-medium text-[#f7f8f8]">
              {enabled
                ? "Browser push notifications enabled"
                : "Enable browser push notifications"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#8a8f98]">
              {enabled
                ? "You will receive task assignment, comment and due-date alerts."
                : "Receive task assignment, comment, completion and due-date reminder alerts."}
            </p>
          </div>
        </div>

        <button
          onClick={enableNotifications}
          disabled={enabled || loading}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            enabled
              ? "cursor-not-allowed border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "btn-primary"
          }`}
        >
          {enabled ? "Enabled" : loading ? "Enabling..." : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}