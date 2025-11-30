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

// Middleware - CORS with proper configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/AuthRoutes");
const ticketRoutes = require("./routes/TicketRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const teamRoutes = require("./routes/TeamRoutes");
const userRoutes = require("./routes/UserRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/user", userRoutes);

// Server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});