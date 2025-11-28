// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { authUser, isAdmin, } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/AdminControler");
const uiSettingsCtrl = require("../controllers/Uisettingscontroller");
const analyticsCtrl = require("../controllers/AnalyticsController")

// admin (Gourav injected)
router.get("/tickets", authUser, isAdmin, adminCtrl.listAllTickets);
router.get("/tickets/:id", authUser, isAdmin, adminCtrl.getTicketDetails);
router.post("/tickets/:id/messages", authUser, isAdmin, adminCtrl.adminAddMessage);
router.post("/tickets/:id/assign", authUser, isAdmin, adminCtrl.assignTicket);
router.patch("/tickets/:id/resolve", authUser, isAdmin, adminCtrl.resolveTicket);
// admin auth-route
// router.get("/users", authUser, isAdmin, adminCtrl.listAllUsers);


// Team Member CRUD routes
router.get("/team-members", authUser, isAdmin, adminCtrl.listAllUsers);
router.post("/team-members", authUser, isAdmin, adminCtrl.createTeamMember);
router.patch("/team-members/:id", authUser, isAdmin, adminCtrl.updateTeamMember);
router.delete("/team-members/:id", authUser, isAdmin, adminCtrl.deleteTeamMember);

//UI SETTING ROUTES


// GET current UI settings - public (no auth required)
router.get("/ui-settings", uiSettingsCtrl.getUISettings);

// UPDATE UI settings - admin only (requires auth + admin verification)
router.put("/ui-settings", authUser, isAdmin, uiSettingsCtrl.updateUISettings);

// RESET to default settings - admin only (requires auth + admin verification)
router.post("/ui-settings/reset", authUser, isAdmin, uiSettingsCtrl.resetUISettings);


// ═══════════════════════════════════════════════════════════════════════════
// TIMER SETTINGS ROUTES (2 routes) ✅ NEW
// ═══════════════════════════════════════════════════════════════════════════

// Get global resolution time limit settings - admin only
router.get("/timer-settings", authUser, isAdmin, analyticsCtrl.getTimerSettings);

// Update global resolution time limit - admin only
router.patch("/timer-settings", authUser, isAdmin, analyticsCtrl.updateTimerSettings);


// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS ROUTES (1 route) ✅ NEW
// ═══════════════════════════════════════════════════════════════════════════

// Get analytics data (totalChats, averageReplyTime, resolvedPercentage, missedChats) - admin only
router.get("/analytics", authUser, isAdmin, analyticsCtrl.getAnalytics);




module.exports = router;
