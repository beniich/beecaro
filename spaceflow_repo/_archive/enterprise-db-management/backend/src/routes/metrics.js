// routes/metrics.js
import express from "express";
import { generateMetrics } from "../data/generator.js";

const router = express.Router();

/**
 * GET /api/metrics
 * Retourne un JSON contenant les indicateurs agrégés.
 */
router.get("/", (req, res) => {
    const metrics = generateMetrics();
    res.json(metrics);
});

export default router;
