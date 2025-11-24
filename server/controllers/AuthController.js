// controllers/authController.js
//(Team signup/login — forces isAdmin: false and prevents creating Gourav)
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // your existing model
const adminConst = require('../constants/admin');

const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";
const JWT_EXPIRES_IN = "7d";
const ADMIN_EMAIL = "gouravsharma20a@gmail.com";

const signToken = (user) => {
  const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return jwt.sign({ _id: user._id, email: user.email, isAdmin:isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, teamId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });

    if (email.toLowerCase() === adminConst.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: "Admin account cannot be created via signup." });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    // Use your User.create flow or static register - your User model has register method
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,      // User model pre-save will hash
      isAdmin: false,
      teamId: teamId || null
    });

    const token = signToken(newUser);
    res.status(201).json({ success: true, user: { name: newUser.name, email: newUser.email, teamId: newUser.teamId }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, ipAddress = null, userAgent = null } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("DEBUG: login attempt for", email.toLowerCase());
    console.log("DEBUG: user found:", !!user);
    if (user) console.log("DEBUG: stored password:", user.password);
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    // use same pepper used in pre-save hook
    const pepper = process.env.PASSWORD_PEPPER || "";
    const passwordWithPepper = password + pepper;


    const match = await bcrypt.compare(passwordWithPepper, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user);
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    

    res.status(200).json({ 
      success: true, 
      message: "Login successful", 
      user: { 
        name: user.name, 
        email: user.email,
        isAdmin: isAdmin,
        teamId: user.teamId 
      }, 
      token 
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || "Invalid credentials" });
  }
};

module.exports = { signup, login };
