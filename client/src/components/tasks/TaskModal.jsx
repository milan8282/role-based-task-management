import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SelectDropdown } from "../ui/DropDown";

const initialState = {
  title: "",
  description: "",
  category: "",
  assignedTo: [],
  dueDate: "",
  priority: "medium",
};

export default function TaskModal({
  open,
  onClose,
  onSave,
  task,
  categories = [],
  users = [],
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        category: task.category?._id || task.category || "",
        assignedTo: Array.isArray(task.assignedTo)
          ? task.assignedTo.map((u) => u._id || u)
          : [],
        dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
        priority: task.priority || "medium",
      });
    } else {
      setForm(initialState);
    }
  }, [task, open]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
  };

  const toggleUser = (id) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter((item) => item !== id)
        : [...prev.assignedTo, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.5px] text-slate-950">
              {task ? "Edit Task" : "Create Task"}
            </h2>
            <p className="text-sm text-slate-500">
              Assign, categorize and schedule team work.
            </p>
          </div>

          <button type="button" onClick={onClose} className="btn-ghost px-3 py-3">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </span>
            <input
              className="input-dark"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              className="input-dark min-h-[120px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Task description"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </span>
              <SelectDropdown
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                placeholder="Select category"
                className="min-w-full"
                options={[
                  { label: "Select category", value: "" },
                  ...categories.map((cat) => ({
                    label: cat.name,
                    value: cat._id,
                  })),
                ]}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </span>
              <SelectDropdown
                value={form.priority}
                onChange={(value) => setForm({ ...form, priority: value })}
                className="min-w-full"
                options={[
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                ]}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Due date
              </span>
              <input
                className="input-dark"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Assign users
            </span>

            <div className="max-h-44 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {users.length === 0 && (
                <p className="px-2 py-3 text-sm text-slate-500">
                  No users available or only admins can load users.
                </p>
              )}

              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={form.assignedTo.includes(user._id)}
                    onChange={() => toggleUser(user._id)}
                    className="accent-[#5e6ad2]"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {task ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}