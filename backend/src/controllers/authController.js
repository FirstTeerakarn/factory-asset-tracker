const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { login, getMe };
