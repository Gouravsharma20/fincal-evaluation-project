// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { requireAuth, isAdmin, isTeamMember } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/AdminControler");

// admin (Gourav injected)
router.get("/tickets", requireAuth, isAdmin, adminCtrl.listTickets);
router.post("/tickets/:id/messages", requireAuth , isAdmin, adminCtrl.adminAddMessage);
router.post("/tickets/:id/assign", requireAuth , isAdmin, adminCtrl.assignTicket);
router.patch("/tickets/:id/resolve", requireAuth, isAdmin, adminCtrl.resolveTicket);

// team members
router.post("/team/tickets/:id/messages", requireAuth, isTeamMember, adminCtrl.teamAddMessage);

module.exports = router;
