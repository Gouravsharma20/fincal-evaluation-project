const express = require("express");
const router = express.Router();
const { authUser, isUser } = require("../middleware/authMiddleware");
const teamCtrl = require("../controllers/TeamController");

console.log("teamCtrl imported:", Object.keys(teamCtrl));

router.get("/tickets", authUser, authUser,isUser, teamCtrl.getAssignedTickets);
router.get("/tickets/:id", authUser, authUser,isUser, teamCtrl.getTicketDetail);
router.post("/tickets/:id/messages", authUser, isUser, teamCtrl.addTeamMessage);
router.patch("/tickets/:id/resolve", authUser, isUser, teamCtrl.resolveTicketByTeam);

module.exports = router;