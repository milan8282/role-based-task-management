import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { taskApi } from "../../api/taskApi";
import { categoryApi } from "../../api/categoryApi";
import { userApi } from "../../api/userApi";
import { useSocket } from "../../context/SocketContext";
import TaskCard from "./TaskCard";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";
import CommentDrawer from "./CommentDrawer";
import { SelectDropdown } from "../ui/Dropdown";

const columns = [
    { key: "todo", label: "Backlog", accent: "bg-[#62666d]" },
    { key: "in_progress", label: "In Progress", accent: "bg-[#5e6ad2]" },
    { key: "completed", label: "Completed", accent: "bg-[#10b981]" }
];

export default function TaskBoard() {
    const { socket } = useSocket();

    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);

    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [commentTask, setCommentTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    const load = async () => {
        const [taskRes, catRes] = await Promise.all([
            taskApi.getAll({
                status: status || undefined,
                category: category || undefined
            }),
            categoryApi.getAll()
        ]);

        setTasks(taskRes.data.data.tasks);
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
    }, [status, category]);

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

    const filteredTasks = useMemo(() => {
        const q = search.trim().toLowerCase();

        return tasks.filter((task) => {
            if (!q) return true;

            return (
                task.title?.toLowerCase().includes(q) ||
                task.description?.toLowerCase().includes(q) ||
                task.category?.name?.toLowerCase().includes(q) ||
                task.assignedTo?.some((user) => user.name?.toLowerCase().includes(q))
            );
        });
    }, [tasks, search]);

    const grouped = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.key] = filteredTasks.filter((task) => task.status === col.key);
            return acc;
        }, {});
    }, [filteredTasks]);

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
                        Drag cards across columns, assign users, comment and receive live updates.
                    </p>
                </div>

                <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary inline-flex items-center justify-center gap-2"
                >
                    <Plus size={17} />
                    Create Task
                </button>
            </div>

            <div className="glass-card mb-5 flex flex-col gap-3 rounded-2xl p-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 text-[#62666d]" size={17} />

                    <input
                        className="input-dark !pl-10"
                        placeholder="Search tasks, categories, descriptions, assignees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <SelectDropdown
                        value={status}
                        placeholder="All status"
                        onChange={setStatus}
                        options={[
                            { label: "All status", value: "" },
                            { label: "Backlog", value: "todo" },
                            { label: "In Progress", value: "in_progress" },
                            { label: "Completed", value: "completed" }
                        ]}
                    />

                    <SelectDropdown
                        value={category}
                        placeholder="All categories"
                        onChange={setCategory}
                        className="min-w-[220px]"
                        options={[
                            { label: "All categories", value: "" },
                            ...categories.map((cat) => ({
                                label: cat.name,
                                value: cat._id
                            }))
                        ]}
                    />

                    <button className="btn-ghost inline-flex items-center justify-center gap-2">
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                </div>
            </div>

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

            <CommentDrawer
                open={Boolean(commentTask)}
                task={commentTask}
                onClose={() => setCommentTask(null)}
            />
        </div>
    );
}