// models/UISettingsModel.js
const mongoose = require('mongoose');

const uiSettingsSchema = new mongoose.Schema(
  {
    // Header Color - Enum based
    headerColor: {
      type: String,
      enum: [
        '#2C4A6E',      // Dark Blue
        '#1f3350',      // Darker Blue
        '#000000',      // Black
        '#FF0000',      // Red
        '#008000',      // Green
        '#800080',      // Purple
        '#FFA500'       // Orange
      ],
      default: '#2C4A6E'
    },

    // Custom Color Heading - Enum based
    customColorHeading: {
      type: String,
      enum: [
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'dark',
        'light'
      ],
      default: 'primary'
    },

    // Button Color - Can be hex or other
    buttonColor: {
      type: String,
      default: '#2C4A6E',
      match: /^#[0-9A-F]{6}$/i
    },

    backgroundColor: {
      type: String,
      default: '#FFFFFF',
      match: /^#[0-9A-F]{6}$/i
    },

    welcomeMessage: {
      type: String,
      default: '👋 Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
      maxlength: 200
    },

    customMessage: {
      type: String,
      default: 'Thank You! We\'ll get back to you soon.',
      maxlength: 200
    },

    missedChatTimerEnabled: {
      type: Boolean,
      default: true
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UISettings', uiSettingsSchema);