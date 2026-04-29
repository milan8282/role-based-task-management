import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function TaskColumn({
  column,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenComments
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.key}`
  });

  return (
    <section
      ref={setNodeRef}
      className={`glass-card min-h-[640px] rounded-2xl p-4 transition ${
        isOver ? "border-[#7170ff]/50 bg-[#7170ff]/[0.06]" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />

          <div>
            <h2 className="font-medium text-[#f7f8f8]">{column.label}</h2>
            <p className="text-xs text-[#62666d]">Drop tasks here</p>
          </div>
        </div>

        <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-xs text-[#8a8f98]">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onOpenComments={onOpenComments}
            />
          ))}

          {tasks.length === 0 && (
            <div
              className={`rounded-2xl border border-dashed p-8 text-center text-sm transition ${
                isOver
                  ? "border-[#7170ff]/60 text-[#d0d6e0]"
                  : "border-white/[0.08] text-[#62666d]"
              }`}
            >
              Drop a task here or create a new one.
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}