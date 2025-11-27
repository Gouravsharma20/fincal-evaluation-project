// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { authUser, isAdmin, } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/AdminControler");

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


module.exports = router;
