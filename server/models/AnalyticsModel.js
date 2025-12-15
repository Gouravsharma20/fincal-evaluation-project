
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 53
  },

  year: {
    type: Number,
    required: true
  },

  missedChatsCount: {
    type: Number,
    default: 0,
    min: 0
  },

  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


analyticsSchema.index({ week: 1, year: 1 }, { unique: true });

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;