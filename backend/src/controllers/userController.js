const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

// GET /api/users — Admin only
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GetAllUsers error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/users/:id — Admin only
const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetUserById error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/users — Admin only
const createUser = async (req, res) => {
  try {
    const { username, password, role = "staff" } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'admin' or 'staff'" });
    }

    // Check duplicate username
    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, password_hash, role]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: result.insertId, username, role },
    });
  } catch (err) {
    console.error("CreateUser error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/users/:id — Admin only
const updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const userId = req.params.id;

    // Prevent admin from demoting themselves
    if (parseInt(userId) === req.user.id && role && role !== "admin") {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updates = [];
    const values = [];

    if (username) {
      // Check duplicate username (excluding self)
      const [dup] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
      if (dup.length > 0) {
        return res.status(409).json({ success: false, message: "Username already exists" });
      }
      updates.push("username = ?");
      values.push(username);
    }

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      values.push(password_hash);
    }

    if (role) {
      if (!["admin", "staff"].includes(role)) {
        return res.status(400).json({ success: false, message: "Role must be 'admin' or 'staff'" });
      }
      updates.push("role = ?");
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("UpdateUser error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/users/:id — Admin only
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("DeleteUser error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
