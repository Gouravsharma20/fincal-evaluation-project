
const express = require("express");
const router = express.Router();
const { authUser } = require("../middleware/authMiddleware");
const userCtrl = require("../controllers/UserControllers");


router.put("/:id/profile/name", authUser, userCtrl.updateName);
router.put("/:id/profile/password", authUser, userCtrl.changePassword);

module.exports = router;