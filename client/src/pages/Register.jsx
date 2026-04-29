import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form);
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
                <p className="text-xs text-[#62666d]">Premium collaboration workspace</p>
              </div>
            </div>

            <h1 className="max-w-xl text-[54px] font-medium leading-[0.96] tracking-[-1.1px] text-[#f7f8f8]">
              Start managing tasks like a real product team.
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-7 text-[#8a8f98]">
              Built for admins, teams and assigned users with secure roles, realtime
              task updates and a polished workflow.
            </p>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-9">
                <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
                  Create workspace account
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.7px]">Create account</h2>
                <p className="mt-2 text-sm text-[#8a8f98]">
                  Register and start managing your work.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-[#d0d6e0]">Name</span>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-[#62666d]" size={17} />
                    <input
                      className="input-dark pl-10"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#d0d6e0]">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-[#62666d]" size={17} />
                    <input
                      className="input-dark pl-10"
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
                      className="input-dark pl-10"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </label>

                <button className="btn-primary w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#8a8f98]">
                Already registered?{" "}
                <Link className="text-[#828fff]" to="/login">
                  Login
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}