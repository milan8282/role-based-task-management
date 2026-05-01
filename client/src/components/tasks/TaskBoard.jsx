import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    Download,
    Search,
    SlidersHorizontal,
    Plus,
    Upload,
    LayoutGrid,
    List,
} from "lucide-react";
import toast from "react-hot-toast";

import { taskApi } from "../../api/taskApi";
import { categoryApi } from "../../api/categoryApi";
import { userApi } from "../../api/userApi";
import { useSocket } from "../../context/SocketContext";
import { downloadBlob } from "../../utils/downloadFile";
import TaskCard from "./TaskCard";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";
import CommentDrawer from "./CommentDrawer";
import TaskImportModal from "./TaskImportModal";
import TaskAdvancedFilters from "./TaskAdvancedFilters";
import Pagination from "./Pagination";

import TaskListView from "./TaskListView";
import { SelectDropdown } from "../ui/DropDown";

const columns = [
    { key: "todo", label: "Backlog", accent: "bg-[#62666d]" },
    { key: "in_progress", label: "In Progress", accent: "bg-[#5e6ad2]" },
    { key: "completed", label: "Completed", accent: "bg-[#10b981]" },
];

const defaultFilters = {
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
};

export default function TaskBoard() {
    const { socket } = useSocket();

    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("taskViewMode") || "kanban";
    });

    const [tasks, setTasks] = useState([]);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);

    const [filters, setFilters] = useState(defaultFilters);

    const [modalOpen, setModalOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [commentTask, setCommentTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const getApiParams = () => ({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        category: filters.category || undefined,
        assignee: filters.assignee || undefined,
        dueFrom: filters.dueFrom || undefined,
        dueTo: filters.dueTo || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
        page: filters.page,
        limit: filters.limit,
    });

    const load = async () => {
        const [taskRes, catRes] = await Promise.all([
            taskApi.getAll(getApiParams()),
            categoryApi.getAll(),
        ]);

        setTasks(taskRes.data.data.tasks);
        setMeta(taskRes.data.data.meta);
        setCategories(catRes.data.data.categories);

        try {
            const userRes = await userApi.getAll();
            setUsers(userRes.data.data.users);
        } catch {
            setUsers([]);
        }
    };

    useEffect(() => {
        load();
    }, [
        filters.status,
        filters.priority,
        filters.category,
        filters.assignee,
        filters.dueFrom,
        filters.dueTo,
        filters.search,
        filters.sortBy,
        filters.sortOrder,
        filters.page,
        filters.limit,
    ]);

    useEffect(() => {
        if (!socket) return;

        socket.on("task:created", ({ task }) => {
            setTasks((prev) => [task, ...prev.filter((item) => item._id !== task._id)]);
        });

        socket.on("task:updated", ({ task }) => {
            setTasks((prev) => prev.map((item) => (item._id === task._id ? task : item)));
        });

        socket.on("task:deleted", ({ taskId }) => {
            setTasks((prev) => prev.filter((item) => item._id !== taskId));
        });

        return () => {
            socket.off("task:created");
            socket.off("task:updated");
            socket.off("task:deleted");
        };
    }, [socket]);

    const grouped = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.key] = tasks.filter((task) => task.status === col.key);
            return acc;
        }, {});
    }, [tasks]);

    const findTaskById = (id) => tasks.find((task) => task._id === id);

    const getStatusFromDroppableId = (id) => {
        if (!id) return null;

        if (String(id).startsWith("column:")) {
            return String(id).replace("column:", "");
        }

        const task = findTaskById(id);
        return task?.status || null;
    };

    const handleDragStart = (event) => {
        setActiveTask(findTaskById(event.active.id) || null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!active || !over) return;

        const task = findTaskById(active.id);
        if (!task) return;

        const nextStatus = getStatusFromDroppableId(over.id);
        if (!nextStatus || task.status === nextStatus) return;

        const previousTasks = tasks;

        setTasks((prev) =>
            prev.map((item) =>
                item._id === task._id ? { ...item, status: nextStatus } : item
            )
        );

        try {
            await taskApi.update(task._id, { status: nextStatus });
            toast.success("Task moved");
        } catch (error) {
            setTasks(previousTasks);
            toast.error(error?.response?.data?.message || "Unable to move task");
        }
    };

    const onSave = async (data) => {
        if (editingTask) {
            await taskApi.update(editingTask._id, data);
            toast.success("Task updated");
        } else {
            await taskApi.create(data);
            toast.success("Task created");
        }

        setModalOpen(false);
        setEditingTask(null);
        load();
    };

    const onDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;

        await taskApi.remove(id);
        toast.success("Task deleted");
        load();
    };

    const onStatusChange = async (task, nextStatus) => {
        const previousTasks = tasks;

        setTasks((prev) =>
            prev.map((item) =>
                item._id === task._id ? { ...item, status: nextStatus } : item
            )
        );

        try {
            await taskApi.update(task._id, { status: nextStatus });
            toast.success("Status updated");
        } catch (error) {
            setTasks(previousTasks);
            toast.error(error?.response?.data?.message || "Unable to update status");
        }
    };

    const exportCsv = async () => {
        try {
            const res = await taskApi.exportCsv(getApiParams());
            downloadBlob(res.data, "tasks.csv");
            toast.success("CSV exported");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Unable to export CSV");
        }
    };

    const updateFilter = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const changeViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem("taskViewMode", mode);
    };

    return (
        <div>
            <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                <div>
                    <p className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#8a8f98]">
                        Realtime task board
                    </p>

                    <h1 className="text-4xl font-medium tracking-[-0.9px] text-[#f7f8f8]">
                        Tasks
                    </h1>

                    <p className="mt-2 text-sm text-[#8a8f98]">
                        Drag cards across columns, assign users, comment, filter, import and export tasks.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => changeViewMode("kanban")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${viewMode === "kanban"
                                ? "bg-[#5e6ad2] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Kanban
                        </button>

                        <button
                            type="button"
                            onClick={() => changeViewMode("list")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${viewMode === "list"
                                ? "bg-[#5e6ad2] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <List size={16} />
                            List
                        </button>
                    </div>

                    <button
                        onClick={exportCsv}
                        className="btn-ghost inline-flex items-center justify-center gap-2"
                    >
                        <Download size={17} />
                        Export CSV
                    </button>

                    <button
                        onClick={() => setImportOpen(true)}
                        className="btn-ghost inline-flex items-center justify-center gap-2"
                    >
                        <Upload size={17} />
                        Import CSV
                    </button>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="btn-primary inline-flex items-center justify-center gap-2"
                    >
                        <Plus size={17} />
                        Create Task
                    </button>
                </div>
            </div>

            <div className="glass-card mb-5 flex flex-col gap-3 rounded-2xl p-3 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 text-[#62666d]" size={17} />

                    <input
                        className="input-dark !pl-10"
                        placeholder="Search tasks by title or description..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <SelectDropdown
                        value={filters.status}
                        placeholder="All status"
                        onChange={(value) => updateFilter("status", value)}
                        options={[
                            { label: "All status", value: "" },
                            { label: "Backlog", value: "todo" },
                            { label: "In Progress", value: "in_progress" },
                            { label: "Completed", value: "completed" },
                        ]}
                    />

                    <SelectDropdown
                        value={filters.priority}
                        placeholder="All priority"
                        onChange={(value) => updateFilter("priority", value)}
                        options={[
                            { label: "All priority", value: "" },
                            { label: "Low", value: "low" },
                            { label: "Medium", value: "medium" },
                            { label: "High", value: "high" },
                        ]}
                    />

                    <SelectDropdown
                        value={filters.limit}
                        placeholder="Page size"
                        onChange={(value) => updateFilter("limit", Number(value))}
                        options={[
                            { label: "10 / page", value: 10 },
                            { label: "20 / page", value: 20 },
                            { label: "50 / page", value: 50 },
                        ]}
                    />

                    <button
                        onClick={() => setAdvancedOpen(true)}
                        className="btn-ghost inline-flex items-center justify-center gap-2"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {viewMode === "kanban" ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid gap-4 xl:grid-cols-3">
                        {columns.map((col) => (
                            <TaskColumn
                                key={col.key}
                                column={col}
                                tasks={grouped[col.key] || []}
                                onEdit={(item) => {
                                    setEditingTask(item);
                                    setModalOpen(true);
                                }}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                                onOpenComments={setCommentTask}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <div className="rotate-2 opacity-95">
                                <TaskCard
                                    task={activeTask}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                    onStatusChange={() => { }}
                                    onOpenComments={() => { }}
                                    isOverlay
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <TaskListView
                    tasks={tasks}
                    onEdit={(item) => {
                        setEditingTask(item);
                        setModalOpen(true);
                    }}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onOpenComments={setCommentTask}
                />
            )}

            <Pagination
                meta={meta}
                onPageChange={(page) =>
                    setFilters((prev) => ({
                        ...prev,
                        page,
                    }))
                }
            />

            <TaskModal
                open={modalOpen}
                task={editingTask}
                categories={categories}
                users={users}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={onSave}
            />

            <TaskImportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onImported={load}
            />

            <TaskAdvancedFilters
                open={advancedOpen}
                onClose={() => setAdvancedOpen(false)}
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                users={users}
                onApply={load}
            />

            <CommentDrawer
                open={Boolean(commentTask)}
                task={commentTask}
                onClose={() => setCommentTask(null)}
            />
        </div>
    );
}