const { pool } = require("../config/database");
const { withTransaction } = require("../utils/dbHelper");

const VALID_STATUSES = ["available", "in_use", "maintenance"];

const logActivity = async (connection, asset_id, user_id, action) => {
  await connection.query(
    "INSERT INTO activity_logs (asset_id, user_id, action, log_date) VALUES (?, ?, ?, NOW())",
    [asset_id, user_id, action]
  );
};

const getAllAssets = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    let query = `
      SELECT a.*, u.username AS checked_out_by
      FROM assets a
      LEFT JOIN users u ON a.current_user_id = u.id
    `;
    let countQuery = `
      SELECT COUNT(*) as total
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
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }
    query += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";

    const [rows] = await pool.query(query, [...values, parsedLimit, offset]);
    const [countRows] = await pool.query(countQuery, values);

    res.json({ 
      success: true, 
      data: rows,
      meta: {
        total: countRows[0].total,
        page: parsedPage,
        limit: parsedLimit
      }
    });
  } catch (err) {
    console.error("GetAllAssets error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAssetById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.username AS checked_out_by
       FROM assets a
       LEFT JOIN users u ON a.current_user_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Asset not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetAssetById error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createAsset = async (req, res) => {
  try {
    const { asset_code, name, category, status = "available" } = req.body;
    if (!asset_code || !name || !category) {
      return res.status(400).json({ success: false, message: "asset_code, name, and category are required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const data = await withTransaction(async (conn) => {
      const [existing] = await conn.query("SELECT id FROM assets WHERE asset_code = ?", [asset_code]);
      if (existing.length > 0) throw { status: 409, message: "Asset code already exists" };

      const [result] = await conn.query(
        "INSERT INTO assets (asset_code, name, category, status) VALUES (?, ?, ?, ?)",
        [asset_code, name, category, status]
      );
      await logActivity(conn, result.insertId, req.user.id, "created");
      return { id: result.insertId, asset_code, name, category, status };
    });

    res.status(201).json({ success: true, message: "Asset created successfully", data });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("CreateAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { asset_code, name, category, status } = req.body;
    const assetId = req.params.id;

    await withTransaction(async (conn) => {
      const [existing] = await conn.query("SELECT id FROM assets WHERE id = ?", [assetId]);
      if (existing.length === 0) throw { status: 404, message: "Asset not found" };

      const updates = [];
      const values = [];

      if (asset_code) {
        const [dup] = await conn.query("SELECT id FROM assets WHERE asset_code = ? AND id != ?", [asset_code, assetId]);
        if (dup.length > 0) throw { status: 409, message: "Asset code already exists" };
        updates.push("asset_code = ?");
        values.push(asset_code);
      }
      if (name) { updates.push("name = ?"); values.push(name); }
      if (category) { updates.push("category = ?"); values.push(category); }
      if (status) {
        if (!VALID_STATUSES.includes(status)) throw { status: 400, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };
        updates.push("status = ?");
        values.push(status);
      }

      if (updates.length === 0) throw { status: 400, message: "No fields to update" };

      values.push(assetId);
      await conn.query(`UPDATE assets SET ${updates.join(", ")} WHERE id = ?`, values);
      await logActivity(conn, assetId, req.user.id, "updated");
    });

    res.json({ success: true, message: "Asset updated successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("UpdateAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const assetId = req.params.id;
    await withTransaction(async (conn) => {
      const [existing] = await conn.query("SELECT id, status FROM assets WHERE id = ?", [assetId]);
      if (existing.length === 0) throw { status: 404, message: "Asset not found" };
      if (existing[0].status === "in_use") throw { status: 400, message: "Cannot delete an asset that is currently in use" };

      await logActivity(conn, assetId, req.user.id, "deleted");
      await conn.query("DELETE FROM assets WHERE id = ?", [assetId]);
    });
    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("DeleteAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const checkoutAsset = async (req, res) => {
  try {
    const assetId = req.params.id;
    const userId = req.user.id;

    await withTransaction(async (conn) => {
      const [rows] = await conn.query("SELECT id, status FROM assets WHERE id = ?", [assetId]);
      if (rows.length === 0) throw { status: 404, message: "Asset not found" };
      if (rows[0].status !== "available") throw { status: 400, message: `Asset is not available (current status: ${rows[0].status})` };

      await conn.query("UPDATE assets SET status = 'in_use', current_user_id = ? WHERE id = ?", [userId, assetId]);
      await logActivity(conn, assetId, userId, "checked_out");
    });
    res.json({ success: true, message: "Asset checked out successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("CheckoutAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const checkinAsset = async (req, res) => {
  try {
    const assetId = req.params.id;
    const userId = req.user.id;

    await withTransaction(async (conn) => {
      const [rows] = await conn.query("SELECT id, status, current_user_id FROM assets WHERE id = ?", [assetId]);
      if (rows.length === 0) throw { status: 404, message: "Asset not found" };
      if (rows[0].status !== "in_use") throw { status: 400, message: "Asset is not currently checked out" };

      if (req.user.role === "staff" && rows[0].current_user_id !== userId) {
        throw { status: 403, message: "You can only check in assets that you checked out" };
      }

      await conn.query("UPDATE assets SET status = 'available', current_user_id = NULL WHERE id = ?", [assetId]);
      await logActivity(conn, assetId, userId, "checked_in");
    });
    res.json({ success: true, message: "Asset checked in successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("CheckinAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, checkoutAsset, checkinAsset,
};
