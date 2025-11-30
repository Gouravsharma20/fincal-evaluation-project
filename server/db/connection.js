// backend/db/connection.js
const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finalEvaluationProject";

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("DB connection established successfully");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

module.exports = mongoose;
