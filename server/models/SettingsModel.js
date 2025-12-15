
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  resolutionTimeLimit: {
    type: Number,
    default: 1, 
    required: true,
    min: 1 
  },
  lastUpdatedBy: { type: String, default: null }, 
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });


settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      resolutionTimeLimit: 1,
      lastUpdatedAt: new Date()
    });
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;