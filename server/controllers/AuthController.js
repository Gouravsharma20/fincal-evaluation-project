// controllers/authController.js
//(Team signup/login — forces isAdmin: false and prevents creating Gourav)
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // your existing model
const adminConst = require('../constants/admin');

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";
const JWT_EXPIRES_IN = "7d";

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

    if (email.toLowerCase() === adminConst.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: "Admin login via this route is forbidden." });
    }

    // Your User model has static login(email,password,ip,userAgent) — use it for lockout logic
    const user = await User.login(email.toLowerCase(), password, ipAddress, userAgent); // returns user or throws
    const token = signToken(user);
    res.json({ success: true, message: "Login successful", user: { name: user.name, email: user.email, teamId: user.teamId }, token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || "Invalid credentials" });
  }
};

module.exports = { signup, login };
