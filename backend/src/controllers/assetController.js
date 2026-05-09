const { pool } = require("../config/database");

const VALID_STATUSES = ["available", "in_use", "maintenance"];

// ─── Helper: บันทึก Activity Log ────────────────────────────────────────────
const logActivity = async (connection, asset_id, user_id, action) => {
  await connection.query(
    "INSERT INTO activity_logs (asset_id, user_id, action, log_date) VALUES (?, ?, ?, NOW())",
    [asset_id, user_id, action]
  );
};

// ─── GET /api/assets ─────────────────────────────────────────────────────────
const getAllAssets = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    let query = `
      SELECT a.*, u.username AS checked_out_by
      FROM assets a
      LEFT JOIN users u ON a.current_user_id = u.id
    `;
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push("a.status = ?");
      values.push(status);
    }
    if (category) {
      conditions.push("a.category = ?");
      values.push(category);
    }
    if (search) {
      conditions.push("(a.name LIKE ? OR a.asset_code LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY a.created_at DESC";

    const [rows] = await pool.query(query, values);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GetAllAssets error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /api/assets/:id ─────────────────────────────────────────────────────
const getAssetById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.username AS checked_out_by
       FROM assets a
       LEFT JOIN users u ON a.current_user_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetAssetById error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── POST /api/assets ── (Admin only) ────────────────────────────────────────
const createAsset = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { asset_code, name, category, status = "available" } = req.body;

    if (!asset_code || !name || !category) {
      return res.status(400).json({
        success: false,
        message: "asset_code, name, and category are required",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const [existing] = await conn.query(
      "SELECT id FROM assets WHERE asset_code = ?",
      [asset_code]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Asset code already exists" });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO assets (asset_code, name, category, status) VALUES (?, ?, ?, ?)",
      [asset_code, name, category, status]
    );

    await logActivity(conn, result.insertId, req.user.id, "created");
    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: { id: result.insertId, asset_code, name, category, status },
    });
  } catch (err) {
    await conn.rollback();
    console.error("CreateAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

// ─── PUT /api/assets/:id ── (Admin only) ─────────────────────────────────────
const updateAsset = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { asset_code, name, category, status } = req.body;
    const assetId = req.params.id;

    const [existing] = await conn.query("SELECT id FROM assets WHERE id = ?", [assetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    const updates = [];
    const values = [];

    if (asset_code) {
      const [dup] = await conn.query(
        "SELECT id FROM assets WHERE asset_code = ? AND id != ?",
        [asset_code, assetId]
      );
      if (dup.length > 0) {
        return res.status(409).json({ success: false, message: "Asset code already exists" });
      }
      updates.push("asset_code = ?");
      values.push(asset_code);
    }
    if (name) { updates.push("name = ?"); values.push(name); }
    if (category) { updates.push("category = ?"); values.push(category); }
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    await conn.beginTransaction();
    values.push(assetId);
    await conn.query(`UPDATE assets SET ${updates.join(", ")} WHERE id = ?`, values);
    await logActivity(conn, assetId, req.user.id, "updated");
    await conn.commit();

    res.json({ success: true, message: "Asset updated successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("UpdateAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

// ─── DELETE /api/assets/:id ── (Admin only) ───────────────────────────────────
const deleteAsset = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const assetId = req.params.id;

    const [existing] = await conn.query(
      "SELECT id, status FROM assets WHERE id = ?",
      [assetId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }
    if (existing[0].status === "in_use") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an asset that is currently in use",
      });
    }

    await conn.beginTransaction();
    await logActivity(conn, assetId, req.user.id, "deleted");
    await conn.query("DELETE FROM assets WHERE id = ?", [assetId]);
    await conn.commit();

    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("DeleteAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

// ─── POST /api/assets/:id/checkout ── (Staff & Admin) ────────────────────────
const checkoutAsset = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const assetId = req.params.id;
    const userId = req.user.id;

    const [rows] = await conn.query(
      "SELECT id, status FROM assets WHERE id = ?",
      [assetId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }
    if (rows[0].status !== "available") {
      return res.status(400).json({
        success: false,
        message: `Asset is not available (current status: ${rows[0].status})`,
      });
    }

    await conn.beginTransaction();
    await conn.query(
      "UPDATE assets SET status = 'in_use', current_user_id = ? WHERE id = ?",
      [userId, assetId]
    );
    await logActivity(conn, assetId, userId, "checked_out");
    await conn.commit();

    res.json({ success: true, message: "Asset checked out successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("CheckoutAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

// ─── POST /api/assets/:id/checkin ── (Staff & Admin) ─────────────────────────
const checkinAsset = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const assetId = req.params.id;
    const userId = req.user.id;

    const [rows] = await conn.query(
      "SELECT id, status, current_user_id FROM assets WHERE id = ?",
      [assetId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }
    if (rows[0].status !== "in_use") {
      return res.status(400).json({
        success: false,
        message: "Asset is not currently checked out",
      });
    }

    // Staff คืนได้เฉพาะของตัวเอง, Admin คืนได้ทุกชิ้น
    if (req.user.role === "staff" && rows[0].current_user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only check in assets that you checked out",
      });
    }

    await conn.beginTransaction();
    await conn.query(
      "UPDATE assets SET status = 'available', current_user_id = NULL WHERE id = ?",
      [assetId]
    );
    await logActivity(conn, assetId, userId, "checked_in");
    await conn.commit();

    res.json({ success: true, message: "Asset checked in successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("CheckinAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  checkoutAsset,
  checkinAsset,
};
