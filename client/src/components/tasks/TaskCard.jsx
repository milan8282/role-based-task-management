import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  Flag,
  GripVertical,
  MessageSquare,
  Pencil,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { SelectDropdown } from "../ui/DropDown";


const priorityStyles = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  high: "border-red-500/20 bg-red-500/10 text-red-300",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenComments,
  isOverlay = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = task.priority || "medium";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border border-white/[0.08] bg-[#191a1b]/80 p-4 transition hover:border-white/[0.14] hover:bg-white/[0.055] ${
        isDragging ? "opacity-40" : ""
      } ${isOverlay ? "w-[360px] shadow-2xl shadow-black/50" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="inline-flex max-w-full rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-[#8a8f98]">
              <span className="truncate">{task.category?.name || "No Category"}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                priorityStyles[priority] || priorityStyles.medium
              }`}
            >
              <Flag size={11} />
              {priorityLabels[priority] || "Medium"}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#f7f8f8]">
            {task.title}
          </h3>
        </div>

        <button
          type="button"
          className="cursor-grab rounded-lg p-1.5 text-[#62666d] transition hover:bg-white/[0.05] hover:text-[#d0d6e0] active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={17} />
        </button>
      </div>

      <p className="mb-4 line-clamp-3 text-sm leading-6 text-[#8a8f98]">
        {task.description}
      </p>

      <div className="space-y-2 text-xs text-[#8a8f98]">
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-[#7170ff]" />
            <span>{format(new Date(task.dueDate), "dd MMM yyyy, hh:mm a")}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <UserCircle2 size={15} />
          <span>By {task.createdBy?.name || "Unknown"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {task.assignedTo?.length ? (
          task.assignedTo.slice(0, 3).map((user) => (
            <span
              key={user._id}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-[#d0d6e0]"
            >
              {user.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-[#62666d]">No assignee</span>
        )}

        {task.assignedTo?.length > 3 && (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-[#8a8f98]">
            +{task.assignedTo.length - 3}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
        <SelectDropdown
          value={task.status}
          className="h-[38px] min-w-0 flex-1 text-xs"
          onChange={(value) => onStatusChange(task, value)}
          options={[
            { label: "Backlog", value: "todo" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
          ]}
        />

        <button
          type="button"
          onClick={() => onOpenComments(task)}
          className="btn-ghost px-3 py-2"
          title="Comments"
        >
          <MessageSquare size={15} />
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="btn-ghost px-3 py-2"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="btn-ghost px-3 py-2 text-red-300"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}