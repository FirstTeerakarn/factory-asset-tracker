const express = require("express");
const router = express.Router();
const {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  checkoutAsset,
  checkinAsset,
} = require("../controllers/assetController");
const { getLogsByAsset } = require("../controllers/logController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// ทุก route ต้อง login
router.use(authenticate);

// Staff & Admin
router.get("/", getAllAssets);                          // GET    /api/assets
router.get("/:id", getAssetById);                       // GET    /api/assets/:id
router.post("/:id/checkout", checkoutAsset);            // POST   /api/assets/:id/checkout
router.post("/:id/checkin", checkinAsset);              // POST   /api/assets/:id/checkin
router.get("/:id/logs", getLogsByAsset);                // GET    /api/assets/:id/logs

// Admin only
router.post("/", authorizeAdmin, createAsset);          // POST   /api/assets
router.put("/:id", authorizeAdmin, updateAsset);        // PUT    /api/assets/:id
router.delete("/:id", authorizeAdmin, deleteAsset);     // DELETE /api/assets/:id

module.exports = router;
