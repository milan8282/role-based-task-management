import { useEffect, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../api/userApi";
import { SelectDropdown } from "../components/ui/Dropdown";


export default function Users() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await userApi.getAll();
    setUsers(res.data.data.users);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    await userApi.updateRole(id, role);
    toast.success("Role updated");
    load();
  };

  const changeStatus = async (id, isActive) => {
    await userApi.updateStatus(id, isActive);
    toast.success("Status updated");
    load();
  };

  return (
    <div>
      <div className="mb-7">
        <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
          Admin control
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.9px]">Users</h1>
        <p className="mt-2 text-sm text-[#8a8f98]">
          Manage roles, permissions and active users.
        </p>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b border-white/[0.06] bg-white/[0.025] text-xs uppercase tracking-wide text-[#62666d]">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.025]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#828fff]">
                        <UserRound size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[#f7f8f8]">{user.name}</p>
                        <p className="text-sm text-[#62666d]">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <SelectDropdown
                      value={user.role}
                      className="h-[40px] min-w-[140px]"
                      onChange={(role) => changeRole(user._id, role)}
                      options={[
                        { label: "Admin", value: "admin" },
                        { label: "User", value: "user" }
                      ]}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => changeStatus(user._id, !user.isActive)}
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#8a8f98]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}