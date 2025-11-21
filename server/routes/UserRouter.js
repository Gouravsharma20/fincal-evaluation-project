const express = require("express");
const { registerUser,loginUser,getAllUsers } = require("../controllers/UserControllers");



const router = express.Router();

//get all users
router.get("/",getAllUsers)

// user Signup
router.post("/register", registerUser)
// user login
router.post("/login",loginUser)


module.exports =  router;