// routes/uiSettingsRoutes.js
const express = require("express");
const router = express.Router();
const { authUser, isAdmin } = require("../middleware/authMiddleware");
const uiSettingsCtrl = require("../controllers/Uisettingscontroller");

// GET current UI settings - public (no auth required)
router.get("/", uiSettingsCtrl.getUISettings);

// UPDATE UI settings - admin only (requires auth + admin verification)
router.put("/", authUser, isAdmin, uiSettingsCtrl.updateUISettings);

// RESET to default settings - admin only (requires auth + admin verification)
router.post("/reset", authUser, isAdmin, uiSettingsCtrl.resetUISettings);

module.exports = router;