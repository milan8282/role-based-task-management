import { Upload, X, AlertTriangle, Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { taskApi } from "../../api/taskApi";
import { downloadTextFile } from "../../utils/downloadFile";

export default function TaskImportModal({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("CSV file size must be less than 2MB");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await taskApi.importCsv(file);
      const data = res.data.data;

      setResult(data);

      if (data.insertedCount > 0) {
        toast.success(`${data.insertedCount} tasks imported`);
      }

      if (data.failedCount > 0) {
        toast.error(`${data.failedCount} rows failed. Download error report.`);
      }

      onImported?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to import CSV");
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorReport = () => {
    if (!result?.errorReportCsv) return;
    downloadTextFile(result.errorReportCsv, "task-import-errors.csv");
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.5px] text-slate-950">
              Import Tasks CSV
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Required headers: title, description, dueDate, priority, status,
              category, assignedUsers.
            </p>
          </div>

          <button type="button" onClick={onClose} className="btn-ghost px-3 py-3">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-[#5e6ad2] shadow-sm">
            <Upload size={20} />
          </div>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
            }}
            className="input-dark"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Max file size: 2MB. Max rows: 500. Assigned users can be separated
            with semicolon, for example: john@example.com;jane@example.com
          </p>
        </div>

        {result && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Total rows: {result.totalRows} | Imported: {result.insertedCount} |
              Failed: {result.failedCount}
            </p>

            {result.failedCount > 0 && (
              <button
                type="button"
                onClick={downloadErrorReport}
                className="btn-ghost mt-3 inline-flex items-center gap-2 text-amber-700"
              >
                <Download size={16} />
                Download Error Report
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <AlertTriangle className="mt-1 shrink-0" size={17} />
          <p>
            Due date cannot be in the past. Status must be todo, in_progress, or
            completed. Priority must be low, medium, or high.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Importing..." : "Import CSV"}
          </button>
        </div>
      </form>
    </div>
  );
}