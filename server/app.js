require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finalEvaluationProject'

const app = express();

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Alternative DB connection (uncomment if using separate db/connection file)
// require("./db/connection");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/AuthRoutes");
const ticketRoutes = require("./routes/TicketRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const teamRoutes = require("./routes/TeamRoutes");
const userRoutes = require("./routes/UserRoutes");
const uiSettingsRoutes = require("./routes/UiSettingRoutes")


app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team",teamRoutes);
app.use("/api/user",userRoutes);
app.use("/api/uisettings",uiSettingsRoutes);


app.get("/api/admin/reset-password", async (req, res) => {
  const bcrypt = require("bcryptjs");
  const User = require("./models/UserModel");

  const newHashed = await bcrypt.hash("Gourav@1234", 10);

  await User.updateOne(
    { email: "gouravsharma20a@gmail.com" },
    { $set: { password: newHashed } }
  );

  res.send("Password updated successfully!");
});





// Server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});