import {
  CalendarDays,
  Flag,
  MessageSquare,
  Pencil,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { SelectDropdown } from "../ui/DropDown";

const priorityStyles = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const statusLabels = {
  todo: "Backlog",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function TaskListView({
  tasks = [],
  onEdit,
  onDelete,
  onStatusChange,
  onOpenComments,
}) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Task</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Due Date</th>
              <th className="px-5 py-4">Assignees</th>
              <th className="px-5 py-4">Created By</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {tasks.map((task) => {
              const priority = task.priority || "medium";

              return (
                <tr key={task._id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="max-w-[320px]">
                      <p className="line-clamp-1 font-semibold text-slate-950">
                        {task.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                        {task.description}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {task.category?.name || "No Category"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                        priorityStyles[priority] || priorityStyles.medium
                      }`}
                    >
                      <Flag size={12} />
                      {priorityLabels[priority] || "Medium"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <SelectDropdown
                      value={task.status}
                      className="h-[38px] min-w-[150px] text-xs"
                      onChange={(value) => onStatusChange(task, value)}
                      options={[
                        { label: "Backlog", value: "todo" },
                        { label: "In Progress", value: "in_progress" },
                        { label: "Completed", value: "completed" },
                      ]}
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {task.dueDate ? (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-[#5e6ad2]" />
                        {format(new Date(task.dueDate), "dd MMM yyyy, hh:mm a")}
                      </div>
                    ) : (
                      <span className="text-slate-400">No due date</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex max-w-[240px] flex-wrap gap-1.5">
                      {task.assignedTo?.length ? (
                        task.assignedTo.slice(0, 3).map((user) => (
                          <span
                            key={user._id}
                            className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                          >
                            {user.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          No assignee
                        </span>
                      )}

                      {task.assignedTo?.length > 3 && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
                          +{task.assignedTo.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <UserCircle2 size={15} />
                      {task.createdBy?.name || "Unknown"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
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
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(task._id)}
                        className="btn-ghost px-3 py-2 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No tasks found for the selected filters.
        </div>
      )}
    </div>
  );
}