import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const navBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "My Tasks", path: "/my-tasks", icon: CheckSquare },
    ...(isAdmin
      ? [
          { label: "All Tasks", path: "/all-tasks", icon: Shield },
          { label: "Categories", path: "/categories", icon: FolderKanban },
          { label: "Users", path: "/users", icon: Users }
        ]
      : []),
    { label: "Notifications", path: "/notifications", icon: Bell }
  ];

  const sidebar = (
    <aside className="flex h-full flex-col bg-[#0f1011]/95 p-4">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#5e6ad2] shadow-lg shadow-indigo-500/20">
            <CheckSquare size={19} />
          </div>
          <div className="text-left">
            <p className="text-[15px] font-semibold text-[#f7f8f8]">TaskFlow</p>
            <p className="text-[11px] text-[#62666d]">Realtime workspace</p>
          </div>
        </button>

        <button className="lg:hidden text-[#8a8f98]" onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
        <p className="truncate text-sm font-medium text-[#f7f8f8]">{user?.name}</p>
        <p className="truncate text-xs text-[#8a8f98]">{user?.email}</p>
        <span className="mt-3 inline-flex rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium capitalize text-[#d0d6e0]">
          {user?.role}
        </span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  navBase,
                  isActive
                    ? "bg-white/[0.07] text-[#f7f8f8] shadow-inner"
                    : "text-[#8a8f98] hover:bg-white/[0.04] hover:text-[#f7f8f8]"
                )
              }
            >
              <Icon size={17} />
              <span className="flex-1">{item.label}</span>
              {item.path === "/notifications" && unreadCount > 0 && (
                <span className="rounded-full bg-[#5e6ad2] px-2 py-0.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-[#d0d6e0] transition hover:bg-white/[0.06]"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen text-[#f7f8f8]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[280px] lg:border-r lg:border-white/[0.06]">
        {sidebar}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[280px] border-r border-white/[0.06]">
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#08090a]/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <button className="lg:hidden text-[#d0d6e0]" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>

            <div className="flex-1">
              <p className="text-sm font-medium text-[#f7f8f8]">Role-Based Task Manager</p>
              <p className="text-xs text-[#62666d]">Live tasks, assignments, comments and notifications</p>
            </div>

            <button
              onClick={() => navigate("/notifications")}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#d0d6e0]"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#5e6ad2] px-1 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}