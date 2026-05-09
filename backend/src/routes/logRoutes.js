const express = require("express");
const router = express.Router();
const { getAllLogs } = require("../controllers/logController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// GET /api/logs — Admin only
router.get("/", authenticate, authorizeAdmin, getAllLogs);

module.exports = router;
