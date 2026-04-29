import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { taskApi } from "../../api/taskApi";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

export default function CommentDrawer({ task, open, onClose }) {
  const { socket } = useSocket();
  const { user, isAdmin } = useAuth();

  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!task?._id) return;

    const res = await taskApi.getComments(task._id);
    setComments(res.data.data.comments);
  };

  useEffect(() => {
    if (!open || !task?._id) return;

    loadComments();
    socket?.emit("task:join", { taskId: task._id });

    return () => {
      socket?.emit("task:leave", { taskId: task._id });
    };
  }, [open, task?._id, socket]);

  useEffect(() => {
    if (!socket || !task?._id) return;

    const onNewComment = ({ comment }) => {
      if (comment.task?._id !== task._id && comment.task !== task._id) return;

      setComments((prev) => {
        if (prev.some((item) => item._id === comment._id)) return prev;
        return [...prev, comment];
      });
    };

    const onUpdatedComment = ({ comment }) => {
      setComments((prev) =>
        prev.map((item) => (item._id === comment._id ? comment : item))
      );
    };

    const onDeletedComment = ({ commentId }) => {
      setComments((prev) => prev.filter((item) => item._id !== commentId));
    };

    socket.on("comment:new", onNewComment);
    socket.on("comment:updated", onUpdatedComment);
    socket.on("comment:deleted", onDeletedComment);

    return () => {
      socket.off("comment:new", onNewComment);
      socket.off("comment:updated", onUpdatedComment);
      socket.off("comment:deleted", onDeletedComment);
    };
  }, [socket, task?._id]);

  if (!open || !task) return null;

  const submit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setLoading(true);

    try {
      await taskApi.addComment(task._id, { message });
      setMessage("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to add comment");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await taskApi.deleteComment(comment._id);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete comment");
    }
  };

  return (
    <div className="fixed inset-0 z-[110]">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-white/[0.08] bg-[#0f1011] shadow-2xl shadow-black/60">
        <div className="border-b border-white/[0.06] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-[#8a8f98]">
                {task.category?.name || "Task"}
              </p>
              <h2 className="text-xl font-medium tracking-[-0.4px] text-[#f7f8f8]">
                {task.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#8a8f98]">
                {task.description}
              </p>
            </div>

            <button onClick={onClose} className="btn-ghost px-3 py-3">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-5">
          {comments.map((comment) => {
            const canDelete =
              isAdmin || String(comment.user?._id || comment.user) === String(user?._id);

            return (
              <div key={comment._id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#f7f8f8]">
                      {comment.user?.name || "User"}
                    </p>
                    <p className="text-xs text-[#62666d]">
                      {format(new Date(comment.createdAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => deleteComment(comment)}
                      className="rounded-lg p-2 text-[#62666d] transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <p className="text-sm leading-6 text-[#d0d6e0]">{comment.message}</p>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-[#62666d]">
              No comments yet. Start the conversation.
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-white/[0.06] p-4">
          <div className="flex gap-3">
            <input
              className="input-dark"
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button disabled={loading} className="btn-primary grid min-w-12 place-items-center px-4">
              <Send size={17} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}