import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";
import { initializeFirebaseAdmin } from "./config/firebase.js";
import { startDueDateReminderCron } from "./cron/dueDateReminder.cron.js";

validateEnv();

const server = http.createServer(app);

initializeFirebaseAdmin();
initializeSocket(server);

connectDB().then(() => {
  startDueDateReminderCron();

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
});