const express = require("express");
const router = express.Router();
const { login, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me — ดูข้อมูลตัวเอง (ต้อง login ก่อน)
router.get("/me", authenticate, getMe);

module.exports = router;
