// controllers/uiSettingsController.js
const UISettings = require('../models/Uisettingsmodel');

// Enum values for header colors
const HEADER_COLOR_ENUM = [
  '#2C4A6E',      // Dark Blue
  '#1f3350',      // Darker Blue
  '#000000',      // Black
  '#FF0000',      // Red
  '#008000',      // Green
  '#800080',      // Purple
  '#FFA500'       // Orange
];

// Enum values for custom color headings
const CUSTOM_COLOR_HEADING_ENUM = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'dark',
  'light'
];

// Default settings
const DEFAULT_SETTINGS = {
  headerColor: '#2C4A6E',
  customColorHeading: 'primary',
  buttonColor: '#2C4A6E',
  backgroundColor: '#FFFFFF',
  welcomeMessage: '👋 Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
  customMessage: 'Thank You! We\'ll get back to you soon.',
  missedChatTimerEnabled: true
};

// GET current UI settings - PUBLIC (no auth required)
const getUISettings = async (req, res) => {
  try {
    let settings = await UISettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await UISettings.create(DEFAULT_SETTINGS);
    }

    res.status(200).json({
      success: true,
      settings: {
        headerColor: settings.headerColor,
        customColorHeading: settings.customColorHeading,
        buttonColor: settings.buttonColor,
        backgroundColor: settings.backgroundColor,
        welcomeMessage: settings.welcomeMessage,
        customMessage: settings.customMessage,
        missedChatTimerEnabled: settings.missedChatTimerEnabled
      },
      enums: {
        headerColorOptions: HEADER_COLOR_ENUM,
        customColorHeadingOptions: CUSTOM_COLOR_HEADING_ENUM
      }
    });
  } catch (error) {
    console.log('Error fetching UI settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching UI settings',
      message: error.message
    });
  }
};

// UPDATE UI settings - ADMIN ONLY (middleware handles auth + admin verification)
const updateUISettings = async (req, res) => {
  try {
    const { headerColor, customColorHeading, buttonColor, backgroundColor, welcomeMessage, customMessage, missedChatTimerEnabled } = req.body;

    // Validate header color is valid enum
    if (headerColor && !HEADER_COLOR_ENUM.includes(headerColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid header color. Must be one of: ' + HEADER_COLOR_ENUM.join(', ')
      });
    }

    // Validate custom color heading is valid enum
    if (customColorHeading && !CUSTOM_COLOR_HEADING_ENUM.includes(customColorHeading)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid custom color heading. Must be one of: ' + CUSTOM_COLOR_HEADING_ENUM.join(', ')
      });
    }

    // Validate button color (hex format)
    const isValidColor = (color) => /^#[0-9A-F]{6}$/i.test(color);

    if (buttonColor && !isValidColor(buttonColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid button color format'
      });
    }

    if (backgroundColor && !isValidColor(backgroundColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid background color format'
      });
    }

    // Validate message lengths
    if (welcomeMessage && welcomeMessage.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Welcome message must be 200 characters or less'
      });
    }

    if (customMessage && customMessage.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Custom message must be 200 characters or less'
      });
    }

    // Find and update the settings
    let settings = await UISettings.findOne();

    if (!settings) {
      // Create if doesn't exist
      settings = await UISettings.create({
        ...DEFAULT_SETTINGS,
        headerColor: headerColor || DEFAULT_SETTINGS.headerColor,
        customColorHeading: customColorHeading || DEFAULT_SETTINGS.customColorHeading,
        buttonColor: buttonColor || DEFAULT_SETTINGS.buttonColor,
        backgroundColor: backgroundColor || DEFAULT_SETTINGS.backgroundColor,
        welcomeMessage: welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
        customMessage: customMessage || DEFAULT_SETTINGS.customMessage,
        missedChatTimerEnabled: missedChatTimerEnabled !== undefined ? missedChatTimerEnabled : DEFAULT_SETTINGS.missedChatTimerEnabled,
        lastUpdatedBy: req.user._id
      });
    } else {
      // Update existing settings
      if (headerColor) settings.headerColor = headerColor;
      if (customColorHeading) settings.customColorHeading = customColorHeading;
      if (buttonColor) settings.buttonColor = buttonColor;
      if (backgroundColor) settings.backgroundColor = backgroundColor;
      if (welcomeMessage) settings.welcomeMessage = welcomeMessage;
      if (customMessage) settings.customMessage = customMessage;
      if (missedChatTimerEnabled !== undefined) settings.missedChatTimerEnabled = missedChatTimerEnabled;
      settings.lastUpdatedBy = req.user._id;

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'UI settings updated successfully',
      settings: {
        headerColor: settings.headerColor,
        customColorHeading: settings.customColorHeading,
        buttonColor: settings.buttonColor,
        backgroundColor: settings.backgroundColor,
        welcomeMessage: settings.welcomeMessage,
        customMessage: settings.customMessage,
        missedChatTimerEnabled: settings.missedChatTimerEnabled
      }
    });
  } catch (error) {
    console.log('Error updating UI settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating UI settings',
      message: error.message
    });
  }
};

// RESET to default settings - ADMIN ONLY (middleware handles auth + admin verification)
const resetUISettings = async (req, res) => {
  try {
    let settings = await UISettings.findOne();

    if (!settings) {
      settings = await UISettings.create({
        ...DEFAULT_SETTINGS,
        lastUpdatedBy: req.user._id
      });
    } else {
      // Reset all settings to defaults
      settings.headerColor = DEFAULT_SETTINGS.headerColor;
      settings.customColorHeading = DEFAULT_SETTINGS.customColorHeading;
      settings.buttonColor = DEFAULT_SETTINGS.buttonColor;
      settings.backgroundColor = DEFAULT_SETTINGS.backgroundColor;
      settings.welcomeMessage = DEFAULT_SETTINGS.welcomeMessage;
      settings.customMessage = DEFAULT_SETTINGS.customMessage;
      settings.missedChatTimerEnabled = DEFAULT_SETTINGS.missedChatTimerEnabled;
      settings.lastUpdatedBy = req.user._id;

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings reset to defaults',
      settings: {
        headerColor: settings.headerColor,
        customColorHeading: settings.customColorHeading,
        buttonColor: settings.buttonColor,
        backgroundColor: settings.backgroundColor,
        welcomeMessage: settings.welcomeMessage,
        customMessage: settings.customMessage,
        missedChatTimerEnabled: settings.missedChatTimerEnabled
      }
    });
  } catch (error) {
    console.log('Error resetting UI settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error resetting UI settings',
      message: error.message
    });
  }
};

module.exports = {
  getUISettings,
  updateUISettings,
  resetUISettings
};