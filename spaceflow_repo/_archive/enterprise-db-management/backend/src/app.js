// app.js
import express from "express";
import cors from "cors";

import metricsRouter from "./routes/metrics.js";
import replicasRouter from "./routes/replicas.js";
import backupsRouter from "./routes/backups.js";
import clustersRouter from "./routes/clusters.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_, res) => res.send("Enterprise DB Backend – up & running"));

app.use("/api/metrics", metricsRouter);
app.use("/api/replicas", replicasRouter);
app.use("/api/backups", backupsRouter);
app.use("/api/clusters", clustersRouter);

export default app;
