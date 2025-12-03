
const UISettings = require('../models/Uisettingsmodel');

const HEADER_COLOR_ENUM = [
  '#FFFFFF',      
  '#000000',      
  '#33475B'       
];


const BACKGROUND_COLOR_ENUM = [
  '#FFFFFF',      
  '#000000',      
  '#FAFBFC'       
];


const DEFAULT_SETTINGS = {
  headerColor: '#33475B',
  backgroundColor: '#FAFBFC',
  formPlaceholders: {
    namePlaceholder: 'Your name',
    phonePlaceholder: '+1 (000) 000-0000',
    emailPlaceholder: 'example@gmail.com',
    buttonText: 'Thank You!'
  },
  welcomeMessage: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
  customMessage: 'Thank You! We\'ll get back to you soon.',
  missedChatTimerEnabled: true
};


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
        backgroundColor: settings.backgroundColor,
        formPlaceholders: settings.formPlaceholders,
        welcomeMessage: settings.welcomeMessage,
        customMessage: settings.customMessage,
        missedChatTimerEnabled: settings.missedChatTimerEnabled
      },
      enums: {
        headerColorOptions: HEADER_COLOR_ENUM,
        backgroundColorOptions: BACKGROUND_COLOR_ENUM
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


const updateUISettings = async (req, res) => {
  try {
    const { 
      headerColor, 
      backgroundColor, 
      formPlaceholders,
      welcomeMessage, 
      customMessage, 
      missedChatTimerEnabled 
    } = req.body;

    

    
    if (headerColor && !HEADER_COLOR_ENUM.includes(headerColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid header color. Must be one of: ' + HEADER_COLOR_ENUM.join(', ')
      });
    }

    if (backgroundColor && !BACKGROUND_COLOR_ENUM.includes(backgroundColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid background color. Must be one of: ' + BACKGROUND_COLOR_ENUM.join(', ')
      });
    }

    if (formPlaceholders) {
      if (typeof formPlaceholders !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'formPlaceholders must be an object'
        });
      }

      if (formPlaceholders.namePlaceholder && formPlaceholders.namePlaceholder.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'namePlaceholder must be 100 characters or less'
        });
      }

      if (formPlaceholders.phonePlaceholder && formPlaceholders.phonePlaceholder.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'phonePlaceholder must be 100 characters or less'
        });
      }

      if (formPlaceholders.emailPlaceholder && formPlaceholders.emailPlaceholder.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'emailPlaceholder must be 100 characters or less'
        });
      }

      if (formPlaceholders.buttonText && formPlaceholders.buttonText.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'buttonText must be 100 characters or less'
        });
      }
    }

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


    let settings = await UISettings.findOne();

    if (!settings) {
      settings = await UISettings.create({
        ...DEFAULT_SETTINGS,
        headerColor: headerColor || DEFAULT_SETTINGS.headerColor,
        backgroundColor: backgroundColor || DEFAULT_SETTINGS.backgroundColor,
        formPlaceholders: formPlaceholders || DEFAULT_SETTINGS.formPlaceholders,
        welcomeMessage: welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
        customMessage: customMessage || DEFAULT_SETTINGS.customMessage,
        missedChatTimerEnabled: missedChatTimerEnabled !== undefined ? missedChatTimerEnabled : DEFAULT_SETTINGS.missedChatTimerEnabled,
        lastUpdatedBy: req.user._id
      });
    } else {
      if (headerColor) settings.headerColor = headerColor;
      if (backgroundColor) settings.backgroundColor = backgroundColor;
      if (formPlaceholders) {
        settings.formPlaceholders = {
          ...settings.formPlaceholders,
          ...formPlaceholders
        };
      }
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
        backgroundColor: settings.backgroundColor,
        formPlaceholders: settings.formPlaceholders,
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


const resetUISettings = async (req, res) => {
  try {
    let settings = await UISettings.findOne();

    if (!settings) {
      settings = await UISettings.create({
        ...DEFAULT_SETTINGS,
        lastUpdatedBy: req.user._id
      });
    } else {
      settings.headerColor = DEFAULT_SETTINGS.headerColor;
      settings.backgroundColor = DEFAULT_SETTINGS.backgroundColor;
      settings.formPlaceholders = DEFAULT_SETTINGS.formPlaceholders;
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
        backgroundColor: settings.backgroundColor,
        formPlaceholders: settings.formPlaceholders,
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
}