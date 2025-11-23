// middleware/auth.js
const jwt = require("jsonwebtoken");
const adminConst = require("../");
const User = require("../models/UserModel"); // your existing User model

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";

/**
 * requireAuth - validate JWT for team members
 */
const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "Invalid token user" });
    const isAdmin = user.email.toLowerCase() === adminConst.ADMIN_EMAIL.toLowerCase();
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: isAdmin,
      teamId: user.teamId
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};


/**
 * isTeamMember - ensure the caller is authenticated team member
 */
const isTeamMember = (req, res, next) => {
  if (!req.user || req.user.isAdmin) {
    return res.status(403).json({ error: "Team member access required" });
  }
  next();
};

module.exports = { requireAuth, isAdmin, isTeamMember };
