const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const password = "Gourav@1234";
    const pepper = process.env.PASSWORD_PEPPER || "";
    const passwordWithPepper = password + pepper;

    console.log("🔐 Hashing password with pepper...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordWithPepper, salt);

    console.log("📝 New hash created:", hash);

    // Update admin user
    const result = await mongoose.connection.collection("users").updateOne(
      { email: "gouravsharma20a@gmail.com" },
      { $set: { password: hash } }
    );

    if (result.matchedCount === 0) {
      console.log("❌ Admin user not found!");
    } else if (result.modifiedCount === 0) {
      console.log("⚠️  User found but not modified");
    } else {
      console.log("✅ Admin password reset successfully!");
      console.log(`Updated ${result.modifiedCount} user(s)`);
    }

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

resetAdmin();