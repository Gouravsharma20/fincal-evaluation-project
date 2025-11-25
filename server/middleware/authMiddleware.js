// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const adminConst = require("../constants/admin");


const authUser = async (req,res,next) =>{
  const {authorization} = req.headers;

  if(!authorization) {
    return res.status(401).json({error:"Auth token is required"})
  }

  const token = authorization.split(" ")[1];
  try {
    const { _id } = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findOne({ _id }).select({ _id: 1, email: 1, name: 1, teamId: 1 });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const isAdmin = user.email.toLowerCase() === adminConst.ADMIN_EMAIL.toLowerCase();
    
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      teamId: user.teamId,
      isAdmin: isAdmin
    };
    next()
    
  } catch (error) {
    return res.status(401).json({error:"Request is not authorized!"})
    
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const isUser = (req, res, next) => {
  if (!req.user || req.user.isAdmin) {
    return res.status(403).json({ error: "User access required" });
  }
  next();
};





module.exports = {authUser,isAdmin,isUser};
