// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { authUser , isAdmin, } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/AdminControler");

// admin (Gourav injected)
router.get("/tickets", authUser, isAdmin, adminCtrl.listAllTickets);
router.get("/tickets/:id", authUser, isAdmin, adminCtrl.getTicketDetails);
router.post("/tickets/:id/messages", authUser , isAdmin, adminCtrl.adminAddMessage);
router.post("/tickets/:id/assign", authUser , isAdmin, adminCtrl.assignTicket);
router.patch("/tickets/:id/resolve", authUser, isAdmin, adminCtrl.resolveTicket);

router.get("/users", authUser, isAdmin, adminCtrl.listAllUsers);

module.exports = router;
