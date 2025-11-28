// models/SettingsModel.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  // Global resolution time limit in minutes
  resolutionTimeLimit: {
    type: Number,
    default: 10, // default 10 minutes
    required: true,
    min: 1 // minimum 1 minute
  },

  // Metadata
  lastUpdatedBy: { type: String, default: null }, // admin email or ID
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      resolutionTimeLimit: 10,
      lastUpdatedAt: new Date()
    });
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;