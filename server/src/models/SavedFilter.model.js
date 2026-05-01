import mongoose from "mongoose";

const savedFilterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Filter name is required"],
      trim: true,
      minlength: [2, "Filter name must be at least 2 characters"],
      maxlength: [80, "Filter name cannot exceed 80 characters"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    filters: {
      status: {
        type: String,
        default: "",
      },
      priority: {
        type: String,
        default: "",
      },
      category: {
        type: String,
        default: "",
      },
      assignee: {
        type: String,
        default: "",
      },
      dueFrom: {
        type: String,
        default: "",
      },
      dueTo: {
        type: String,
        default: "",
      },
      search: {
        type: String,
        default: "",
      },
      sortBy: {
        type: String,
        default: "createdAt",
      },
      sortOrder: {
        type: String,
        default: "desc",
      },
      pageSize: {
        type: Number,
        default: 10,
      },
    },
  },
  {
    timestamps: true,
  }
);

savedFilterSchema.index({ user: 1, name: 1 }, { unique: true });

const SavedFilter = mongoose.model("SavedFilter", savedFilterSchema);

export default SavedFilter;