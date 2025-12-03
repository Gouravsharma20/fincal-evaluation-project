
const AnalyticsUtils = require("../utils/AnalyticsUtils");
const Settings = require("../models/SettingsModel");




const getTimerSettings = async (req, res) => {
  try {
    let settings = await Settings.getInstance();

    res.status(200).json({
      success: true,
      settings: {
        resolutionTimeLimit: settings.resolutionTimeLimit,
        lastUpdatedAt: settings.lastUpdatedAt,
        lastUpdatedBy: settings.lastUpdatedBy
      }
    });
  } catch (error) {
    console.log('Error fetching timer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching timer settings',
      message: error.message
    });
  }
};


const updateTimerSettings = async (req, res) => {
  try {
    const { resolutionTimeLimit } = req.body;

    if (resolutionTimeLimit !== undefined) {
      if (typeof resolutionTimeLimit !== 'number' || resolutionTimeLimit <= 0) {
        return res.status(400).json({
          success: false,
          error: 'resolutionTimeLimit must be a positive number'
        });
      }
    }

    let settings = await Settings.getInstance();
    settings.resolutionTimeLimit = resolutionTimeLimit;
    settings.lastUpdatedAt = new Date();
    settings.lastUpdatedBy = req.user._id;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Timer settings updated successfully',
      settings: {
        resolutionTimeLimit: settings.resolutionTimeLimit,
        lastUpdatedAt: settings.lastUpdatedAt,
        lastUpdatedBy: settings.lastUpdatedBy
      }
    });
  } catch (error) {
    console.log('Error updating timer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating timer settings',
      message: error.message
    });
  }
};




const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await AnalyticsUtils.getAllAnalytics();

    res.status(200).json({
      success: true,
      analytics: analyticsData
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching analytics',
      message: error.message
    });
  }
};


module.exports = {
  getTimerSettings,
  updateTimerSettings,
  getAnalytics
};