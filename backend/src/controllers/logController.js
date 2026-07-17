const { pool } = require("../config/database");

// GET /api/logs — Admin only
const getAllLogs = async (req, res) => {
  try {
    const { asset_id, user_id, action, page = 1, limit = 50 } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    let query = `
      SELECT 
        al.id,
        al.action,
        al.log_date,
        a.asset_code,
        a.name AS asset_name,
        u.username
      FROM activity_logs al
      LEFT JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u ON al.user_id = u.id
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM activity_logs al
      LEFT JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const conditions = [];
    const values = [];

    if (asset_id) { conditions.push("al.asset_id = ?"); values.push(asset_id); }
    if (user_id) { conditions.push("al.user_id = ?"); values.push(user_id); }
    if (action) { conditions.push("al.action = ?"); values.push(action); }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }
    query += " ORDER BY al.log_date DESC LIMIT ? OFFSET ?";

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
    console.error("GetAllLogs error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/logs/asset/:id — ประวัติของ asset ชิ้นนึง
const getLogsByAsset = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.log_date, u.username
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.asset_id = ?
       ORDER BY al.log_date DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GetLogsByAsset error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllLogs, getLogsByAsset };
