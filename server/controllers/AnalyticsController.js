// controllers/analyticsController.js
const AnalyticsUtils = require("../utils/AnalyticsUtils");
const Settings = require("../models/SettingsModel");

// ✅ ═══════════════════════════════════════════════════════════════════════════
// ✅ TIMER SETTINGS CONTROLLERS
// ✅ ═══════════════════════════════════════════════════════════════════════════

/**
 * ✅ NEW: Get global resolution time limit settings
 * @route GET /api/admin/timer-settings
 * @access Admin
 * @returns {Object} - resolutionTimeLimit, lastUpdatedAt, lastUpdatedBy
 */
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

/**
 * ✅ NEW: Update global resolution time limit
 * @route PATCH /api/admin/timer-settings
 * @access Admin
 * @body {number} resolutionTimeLimit - Time limit in minutes (must be positive)
 * @returns {Object} - Updated settings
 */
const updateTimerSettings = async (req, res) => {
  try {
    const { resolutionTimeLimit } = req.body;

    // Validate resolutionTimeLimit
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

// ✅ ═══════════════════════════════════════════════════════════════════════════
// ✅ ANALYTICS CONTROLLERS
// ✅ ═══════════════════════════════════════════════════════════════════════════

/**
 * ✅ NEW: Get all analytics data for dashboard
 * @route GET /api/admin/analytics
 * @access Admin
 * @returns {Object} - totalChats, averageReplyTime, resolvedTicketsPercentage, missedChatsPerWeek
 */
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

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // ✅ Timer Settings
  getTimerSettings,
  updateTimerSettings,

  // ✅ Analytics
  getAnalytics
};