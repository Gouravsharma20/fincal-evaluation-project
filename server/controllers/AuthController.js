const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const adminConst = require('../constants/admin');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const ADMIN_EMAIL = "gouravsharma20a@gmail.com";

const signToken = (user) => {
  const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return jwt.sign({ _id: user._id, email: user.email, isAdmin: isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, teamId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });

    if (email.toLowerCase() === adminConst.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: "Admin account cannot be created via signup." });
    }

    const newUser = await User.register(name, email, password);

    if (teamId) {
      newUser.teamId = teamId;
      await newUser.save();
    }

    const token = signToken(newUser);
    res.status(201).json({
      success: true, message: "User created successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, teamId: newUser.teamId }, token
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes("Email already exists")) {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "email and password required" });


    const user = await User.login(email, password, null, null);

    const token = signToken(user);
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: isAdmin,
        teamId: user.teamId
      },
      token
    });
  } catch (err) {
    console.error("LOGIN Error:", err.message);
    res.status(401).json({ error: err.message || "Invalid credentials" });
  }
};

module.exports = { signup, login };
