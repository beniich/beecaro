import http from "http";
import app from "./app.js";
import { initLogSocket } from "./sockets/logs.js";
import { initSchedulerSocket } from "./sockets/scheduler.js";

const PORT = process.env.PORT || 4001;

const server = http.createServer(app);
initLogSocket(server);
initSchedulerSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
