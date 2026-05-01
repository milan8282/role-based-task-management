import { Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { savedFilterApi } from "../../api/savedFilterApi";
import { SelectDropdown } from "../ui/DropDown";


export default function TaskAdvancedFilters({
  open,
  onClose,
  filters,
  setFilters,
  categories,
  users,
  onApply,
}) {
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState("");

  const loadSavedFilters = async () => {
    try {
      const res = await savedFilterApi.getAll();
      setSavedFilters(res.data.data.savedFilters);
    } catch {
      setSavedFilters([]);
    }
  };

  useEffect(() => {
    if (open) loadSavedFilters();
  }, [open]);

  if (!open) return null;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const saveFilter = async () => {
    if (!filterName.trim()) {
      toast.error("Filter name is required");
      return;
    }

    await savedFilterApi.create({
      name: filterName,
      filters: {
        status: filters.status || "",
        priority: filters.priority || "",
        category: filters.category || "",
        assignee: filters.assignee || "",
        dueFrom: filters.dueFrom || "",
        dueTo: filters.dueTo || "",
        search: filters.search || "",
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
        pageSize: Number(filters.limit || 10),
      },
    });

    toast.success("Filter saved");
    setFilterName("");
    loadSavedFilters();
  };

  const loadFilter = (savedFilter) => {
    setFilters((prev) => ({
      ...prev,
      ...savedFilter.filters,
      limit: savedFilter.filters.pageSize || 10,
      page: 1,
    }));

    toast.success("Filter loaded");
    onClose();
  };

  const removeFilter = async (id) => {
    await savedFilterApi.remove(id);
    toast.success("Saved filter removed");
    loadSavedFilters();
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      category: "",
      assignee: "",
      dueFrom: "",
      dueTo: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="fixed inset-0 z-[115] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[24px] border border-white/[0.08] bg-[#0f1011] p-5 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.5px]">
              Advanced Filters
            </h2>
            <p className="mt-1 text-sm text-[#8a8f98]">
              Combine status, priority, due date, assignee, sorting and search.
            </p>
          </div>

          <button type="button" onClick={onClose} className="btn-ghost px-3 py-3">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <h3 className="mb-4 font-medium">Filter Criteria</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Status</span>
                <SelectDropdown
                  value={filters.status}
                  onChange={(value) => updateFilter("status", value)}
                  options={[
                    { label: "All status", value: "" },
                    { label: "Backlog", value: "todo" },
                    { label: "In Progress", value: "in_progress" },
                    { label: "Completed", value: "completed" },
                  ]}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Priority</span>
                <SelectDropdown
                  value={filters.priority}
                  onChange={(value) => updateFilter("priority", value)}
                  options={[
                    { label: "All priority", value: "" },
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Category</span>
                <SelectDropdown
                  value={filters.category}
                  onChange={(value) => updateFilter("category", value)}
                  className="min-w-[170px]"
                  options={[
                    { label: "All categories", value: "" },
                    ...categories.map((cat) => ({
                      label: cat.name,
                      value: cat._id,
                    })),
                  ]}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Assignee</span>
                <SelectDropdown
                  value={filters.assignee}
                  onChange={(value) => updateFilter("assignee", value)}
                  className="min-w-[170px]"
                  options={[
                    { label: "All assignees", value: "" },
                    ...users.map((user) => ({
                      label: user.name,
                      value: user._id,
                    })),
                  ]}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Due From</span>
                <input
                  type="date"
                  className="input-dark"
                  value={filters.dueFrom}
                  onChange={(e) => updateFilter("dueFrom", e.target.value)}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Due To</span>
                <input
                  type="date"
                  className="input-dark"
                  value={filters.dueTo}
                  onChange={(e) => updateFilter("dueTo", e.target.value)}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Sort By</span>
                <SelectDropdown
                  value={filters.sortBy}
                  onChange={(value) => updateFilter("sortBy", value)}
                  options={[
                    { label: "Created Date", value: "createdAt" },
                    { label: "Due Date", value: "dueDate" },
                    { label: "Priority", value: "priority" },
                    { label: "Status", value: "status" },
                    { label: "Title", value: "title" },
                  ]}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-[#d0d6e0]">Sort Order</span>
                <SelectDropdown
                  value={filters.sortOrder}
                  onChange={(value) => updateFilter("sortOrder", value)}
                  options={[
                    { label: "Descending", value: "desc" },
                    { label: "Ascending", value: "asc" },
                  ]}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="btn-primary"
              >
                Apply Filters
              </button>

              <button type="button" onClick={clearFilters} className="btn-ghost">
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <h3 className="mb-4 font-medium">Save / Load Filters</h3>

            <div className="flex gap-2">
              <input
                className="input-dark"
                placeholder="Filter name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />

              <button
                type="button"
                onClick={saveFilter}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
            </div>

            <div className="mt-4 max-h-[340px] space-y-2 overflow-auto">
              {savedFilters.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                >
                  <button
                    type="button"
                    onClick={() => loadFilter(item)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-[#f7f8f8]">
                      {item.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#62666d]">
                      {item.filters?.status || "all"} /{" "}
                      {item.filters?.priority || "all"} /{" "}
                      {item.filters?.sortBy || "createdAt"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFilter(item._id)}
                    className="btn-ghost px-3 py-2 text-red-300"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {savedFilters.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-sm text-[#62666d]">
                  No saved filters yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}