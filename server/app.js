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

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);

// Server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});