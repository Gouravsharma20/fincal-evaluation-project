// controllers/userController.js
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ error: "Name must be at least 3 characters" });
    }

    if (name.trim().length > 35) {
      return res.status(400).json({ error: "Name cannot exceed 35 characters" });
    }

    // Update user name
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (err) {
    console.error("UPDATE NAME Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update password (pre-save hook will hash it automatically with pepper)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("CHANGE PASSWORD Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { updateName, changePassword };