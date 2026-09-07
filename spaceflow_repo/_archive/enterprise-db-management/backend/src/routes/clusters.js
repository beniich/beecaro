import express from "express";
import { clusters } from "../data/fixtures.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(clusters);
});

export default router;
