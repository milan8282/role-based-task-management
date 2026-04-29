import { useEffect, useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { categoryApi } from "../api/categoryApi";

const emptyForm = {
  name: "",
  description: "",
  isActive: true
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    const res = await categoryApi.getAll();
    setCategories(res.data.data.categories);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (editingCategory) {
      await categoryApi.update(editingCategory._id, form);
      toast.success("Category updated");
    } else {
      await categoryApi.create(form);
      toast.success("Category created");
    }

    setModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
    load();
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    await categoryApi.remove(category._id);
    toast.success("Category deleted");
    load();
  };

  const toggleStatus = async (category) => {
    await categoryApi.update(category._id, {
      isActive: !category.isActive
    });

    toast.success("Category status updated");
    load();
  };

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
            Admin workspace
          </p>

          <h1 className="text-4xl font-medium tracking-[-0.9px] text-[#f7f8f8]">
            Categories
          </h1>

          <p className="mt-2 text-sm text-[#8a8f98]">
            Organize tasks by workspace, department, priority or project type.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus size={17} />
          Create Category
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category._id}
            className="glass-card rounded-2xl p-5 transition hover:border-white/[0.14]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#828fff]">
                <FolderKanban size={20} />
              </div>

              <button
                onClick={() => toggleStatus(category)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category.isActive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <h3 className="text-lg font-medium text-[#f7f8f8]">
              {category.name}
            </h3>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#8a8f98]">
              {category.description || "No description added."}
            </p>

            <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
              <button
                onClick={() => openEdit(category)}
                className="btn-ghost inline-flex flex-1 items-center justify-center gap-2"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={() => remove(category)}
                className="btn-ghost inline-flex items-center justify-center gap-2 text-red-300"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center text-[#8a8f98]">
          No categories yet. Create your first category.
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-lg rounded-[24px] border border-white/[0.08] bg-[#0f1011] p-5 shadow-2xl shadow-black/50"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.5px]">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h2>
                <p className="text-sm text-[#8a8f98]">
                  Categories help your team structure tasks.
                </p>
              </div>

              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost px-3 py-3">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">
                  Name
                </span>
                <input
                  className="input-dark"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Development"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">
                  Description
                </span>
                <textarea
                  className="input-dark min-h-[110px] resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Tasks related to frontend, backend, QA..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                <input
                  type="checkbox"
                  className="accent-[#5e6ad2]"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <div>
                  <p className="text-sm text-[#f7f8f8]">Active category</p>
                  <p className="text-xs text-[#62666d]">
                    Inactive categories cannot be used for new tasks.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-ghost"
              >
                Cancel
              </button>

              <button type="submit" className="btn-primary">
                {editingCategory ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}