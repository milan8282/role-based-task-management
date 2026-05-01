import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0f1011]/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden border-r border-white/[0.06] bg-white/[0.02] p-10 lg:block">
            <div className="mb-20 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5e6ad2]">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <p className="font-semibold">TaskFlow</p>
                <p className="text-xs text-[#62666d]">Realtime task operating system</p>
              </div>
            </div>

            <h1 className="max-w-xl text-[54px] font-medium leading-[0.96] tracking-[-1.1px] text-[#f7f8f8]">
              Manage work with clarity, speed and control.
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-7 text-[#8a8f98]">
              Role-based task management, realtime updates, assignment tracking,
              comments, due-date reminders and notifications in one premium workspace.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
              {["RBAC", "Socket.io", "Push alerts", "Task boards"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-[#d0d6e0]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-9">
                <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
                  Welcome back
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.7px]">Login to TaskFlow</h2>
                <p className="mt-2 text-sm text-[#8a8f98]">
                  Continue where your team left off.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-[#d0d6e0]">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-[#62666d]" size={17} />
                    <input
                      className="input-dark !pl-10"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#d0d6e0]">Password</span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-[#62666d]" size={17} />
                    <input
                      className="input-dark !pl-10"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </label>

                <button className="btn-primary w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#8a8f98]">
                New here?{" "}
                <Link className="text-[#828fff]" to="/register">
                  Create account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}