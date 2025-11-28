// models/AnalyticsModel.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  // ISO week number (1-52)
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 53
  },

  // Year (e.g., 2025)
  year: {
    type: Number,
    required: true
  },

  // Count of tickets marked as isMissedChat: true in this week
  missedChatsCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Timestamp when this week's data was last updated
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create unique index on week + year combination
analyticsSchema.index({ week: 1, year: 1 }, { unique: true });

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;