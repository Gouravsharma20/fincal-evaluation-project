
const express = require("express");
const router = express.Router();
const { authUser, isAdmin, } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/AdminControler");
const uiSettingsCtrl = require("../controllers/Uisettingscontroller");
const analyticsCtrl = require("../controllers/AnalyticsController")

router.get("/tickets/:id", authUser, isAdmin, adminCtrl.getTicketDetails);
router.get("/tickets", authUser, isAdmin, adminCtrl.listAllTickets);
router.post("/tickets/:id/messages", authUser, isAdmin, adminCtrl.adminAddMessage);
router.post("/tickets/:id/assign", authUser, isAdmin, adminCtrl.assignTicket);
router.patch("/tickets/:id/resolve", authUser, isAdmin, adminCtrl.resolveTicket);


router.get("/team-members", authUser, isAdmin, adminCtrl.listAllUsers);
router.post("/team-members", authUser, isAdmin, adminCtrl.createTeamMember);
router.patch("/team-members/:id", authUser, isAdmin, adminCtrl.updateTeamMember);
router.delete("/team-members/:id", authUser, isAdmin, adminCtrl.deleteTeamMember);





router.get("/ui-settings", uiSettingsCtrl.getUISettings);


router.put("/ui-settings", authUser, isAdmin, uiSettingsCtrl.updateUISettings);

router.post("/ui-settings/reset", authUser, isAdmin, uiSettingsCtrl.resetUISettings);




router.get("/timer-settings", authUser, isAdmin, analyticsCtrl.getTimerSettings);


router.patch("/timer-settings", authUser, isAdmin, analyticsCtrl.updateTimerSettings);




router.get("/analytics", authUser, isAdmin, analyticsCtrl.getAnalytics);




module.exports = router;
