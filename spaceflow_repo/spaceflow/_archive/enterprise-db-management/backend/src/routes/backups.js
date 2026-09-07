import express from "express";
import { backups } from "../data/fixtures.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(backups);
});

export default router;
