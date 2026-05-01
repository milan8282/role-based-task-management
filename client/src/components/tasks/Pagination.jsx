import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const currentPage = Number(meta.page || 1);
  const totalPages = Number(meta.totalPages || 1);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row">
      <p className="text-sm text-[#8a8f98]">
        Page <span className="text-[#f7f8f8]">{currentPage}</span> of{" "}
        <span className="text-[#f7f8f8]">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}