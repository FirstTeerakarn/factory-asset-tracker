const { pool } = require("../config/database");

/**
 * Helper to manage database transactions.
 * @param {Function} callback - Function that takes a connection and returns a promise.
 * @returns {Promise<any>} - The result of the callback.
 */
const withTransaction = async (callback) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { withTransaction };
