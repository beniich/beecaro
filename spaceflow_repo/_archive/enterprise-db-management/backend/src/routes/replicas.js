import express from "express";
import { clusters } from "../data/fixtures.js";

const router = express.Router();

router.get("/", (req, res) => {
    const replicas = clusters.filter((c) => c.role === "replica");
    res.json(replicas);
});

export default router;
