import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SelectDropdown } from "../ui/Dropdown";

const initialState = {
    title: "",
    description: "",
    category: "",
    assignedTo: [],
    dueDate: ""
};

export default function TaskModal({ open, onClose, onSave, task, categories, users }) {
    const [form, setForm] = useState(initialState);

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || "",
                description: task.description || "",
                category: task.category?._id || task.category || "",
                assignedTo: task.assignedTo?.map((u) => u._id) || [],
                dueDate: task.dueDate ? task.dueDate.slice(0, 16) : ""
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
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
        });
    };

    const toggleUser = (id) => {
        setForm((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(id)
                ? prev.assignedTo.filter((item) => item !== id)
                : [...prev.assignedTo, id]
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
            <form
                onSubmit={submit}
                className="w-full max-w-2xl rounded-[24px] border border-white/[0.08] bg-[#0f1011] p-5 shadow-2xl shadow-black/50"
            >
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-medium tracking-[-0.5px]">
                            {task ? "Edit Task" : "Create Task"}
                        </h2>
                        <p className="text-sm text-[#8a8f98]">
                            Assign, categorize and schedule team work.
                        </p>
                    </div>

                    <button type="button" onClick={onClose} className="btn-ghost px-3 py-3">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <label>
                        <span className="mb-2 block text-sm text-[#d0d6e0]">Title</span>
                        <input
                            className="input-dark"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Task title"
                            required
                        />
                    </label>

                    <label>
                        <span className="mb-2 block text-sm text-[#d0d6e0]">Description</span>
                        <textarea
                            className="input-dark min-h-[120px] resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Task description"
                            required
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="mb-2 block text-sm text-[#d0d6e0]">Category</span>
                            <SelectDropdown
                                value={form.category}
                                onChange={(value) => setForm({ ...form, category: value })}
                                placeholder="Select category"
                                options={[
                                    { label: "Select category", value: "" },
                                    ...categories.map((cat) => ({
                                        label: cat.name,
                                        value: cat._id
                                    }))
                                ]}
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-sm text-[#d0d6e0]">Due date</span>
                            <input
                                className="input-dark"
                                type="datetime-local"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            />
                        </label>
                    </div>

                    <div>
                        <span className="mb-2 block text-sm text-[#d0d6e0]">Assign users</span>
                        <div className="max-h-44 space-y-2 overflow-auto rounded-2xl border border-white/[0.08] bg-white/[0.025] p-2">
                            {users.length === 0 && (
                                <p className="px-2 py-3 text-sm text-[#62666d]">
                                    No users available or only admins can load users.
                                </p>
                            )}

                            {users.map((user) => (
                                <label
                                    key={user._id}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.04]"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.assignedTo.includes(user._id)}
                                        onChange={() => toggleUser(user._id)}
                                        className="accent-[#5e6ad2]"
                                    />
                                    <div>
                                        <p className="text-sm text-[#f7f8f8]">{user.name}</p>
                                        <p className="text-xs text-[#62666d]">{user.email}</p>
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