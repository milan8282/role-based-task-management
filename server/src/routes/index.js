import express from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import taskRoutes from "./task.routes.js";
import commentRoutes from "./comment.routes.js";
import notificationRoutes from "./notification.routes.js";
import deviceTokenRoutes from "./deviceToken.routes.js";
import savedFilterRoutes from "./savedFilter.routes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/tasks", taskRoutes);
router.use("/", commentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/device-tokens", deviceTokenRoutes);
router.use("/saved-filters", savedFilterRoutes);

export default router;