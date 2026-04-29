import { Bell, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const cards = [
    { label: "Current user", value: user?.name, sub: user?.email, icon: ShieldCheck },
    { label: "Role", value: user?.role, sub: "Permission level", icon: CheckCircle2 },
    { label: "Unread alerts", value: unreadCount, sub: "Live notifications", icon: Bell },
    { label: "Workspace", value: "Realtime", sub: "Socket connected product", icon: Clock3 }
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
          Product workspace
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.9px] text-[#f7f8f8]">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-[#8a8f98]">
          Manage tasks, assignments, comments, realtime updates and role-based access.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="glass-card rounded-2xl p-5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#828fff]">
                <Icon size={20} />
              </div>
              <p className="text-sm text-[#8a8f98]">{card.label}</p>
              <h3 className="mt-1 text-2xl font-medium capitalize tracking-[-0.4px]">
                {card.value}
              </h3>
              <p className="mt-1 text-sm text-[#62666d]">{card.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}