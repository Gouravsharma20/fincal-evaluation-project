// models/UISettingsModel.js
const mongoose = require('mongoose');

const uiSettingsSchema = new mongoose.Schema(
  {
    // ════════════════════════════════════════════════════════════════════════
    // HEADER COLOR SETTINGS
    // ════════════════════════════════════════════════════════════════════════
    
    headerColor: {
      type: String,
      enum: [
        '#FFFFFF',     // White
        '#000000',     // Black
        '#33475B',     // Default Blue
      ],
      default: '#33475B'
    },

    // ════════════════════════════════════════════════════════════════════════
    // BACKGROUND COLOR SETTINGS
    // ════════════════════════════════════════════════════════════════════════
    
    backgroundColor: {
      type: String,
      enum: [
        '#FFFFFF',     // White
        '#000000',     // Black
        '#FAFBFC',     // Light Gray
      ],
      default: '#FAFBFC'
    },

    // ════════════════════════════════════════════════════════════════════════
    // INTRODUCTION FORM PLACEHOLDERS (NEW)
    // ════════════════════════════════════════════════════════════════════════
    
    formPlaceholders: {
      type: {
        namePlaceholder: {
          type: String,
          default: 'Your name',
          maxlength: 100
        },
        phonePlaceholder: {
          type: String,
          default: '+1 (000) 000-0000',
          maxlength: 100
        },
        emailPlaceholder: {
          type: String,
          default: 'example@gmail.com',
          maxlength: 100
        },
        buttonText: {
          type: String,
          default: 'Thank You!',
          maxlength: 100
        }
      },
      default: {
        namePlaceholder: 'Your name',
        phonePlaceholder: '+1 (000) 000-0000',
        emailPlaceholder: 'example@gmail.com',
        buttonText: 'Thank You!'
      }
    },

    // ════════════════════════════════════════════════════════════════════════
    // WELCOME MESSAGE SETTINGS
    // ════════════════════════════════════════════════════════════════════════
    
    welcomeMessage: {
      type: String,
      default: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
      maxlength: 200
    },

    // ════════════════════════════════════════════════════════════════════════
    // CUSTOM/SUCCESS MESSAGE SETTINGS
    // ════════════════════════════════════════════════════════════════════════
    
    customMessage: {
      type: String,
      default: 'Thank You! We\'ll get back to you soon.',
      maxlength: 200
    },

    // ════════════════════════════════════════════════════════════════════════
    // MISSED CHAT TIMER SETTINGS
    // ════════════════════════════════════════════════════════════════════════
    
    missedChatTimerEnabled: {
      type: Boolean,
      default: true
    },

    // ════════════════════════════════════════════════════════════════════════
    // METADATA
    // ════════════════════════════════════════════════════════════════════════
    
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