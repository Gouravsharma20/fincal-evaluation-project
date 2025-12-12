// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finalEvaluationProject'

// const app = express();


// mongoose.connect(MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));




// app.use(cors({
//   origin: "*",  
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.use(express.json());


// const authRoutes = require("./routes/AuthRoutes");
// const ticketRoutes = require("./routes/TicketRoutes");
// const adminRoutes = require("./routes/AdminRoutes");
// const teamRoutes = require("./routes/TeamRoutes");
// const userRoutes = require("./routes/UserRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/user", userRoutes);


// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finalEvaluationProject'

const app = express();

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// CORS Configuration
app.use(cors({
  origin: "*",  
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parser
app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
  console.log('==========================================');
  console.log('REQUEST:', req.method, req.path);
  console.log('AUTH:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('==========================================');
  next();
});

// Import Routes
const authRoutes = require("./routes/AuthRoutes");
const ticketRoutes = require("./routes/TicketRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const teamRoutes = require("./routes/TeamRoutes");
const userRoutes = require("./routes/UserRoutes");

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/user", userRoutes);

// Start Server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
