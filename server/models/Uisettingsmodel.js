
const mongoose = require('mongoose');

const uiSettingsSchema = new mongoose.Schema(
  {
    
    headerColor: {
      type: String,
      enum: [
        '#FFFFFF',     
        '#000000',     
        '#33475B',     
      ],
      default: '#33475B'
    },

    
    backgroundColor: {
      type: String,
      enum: [
        '#FFFFFF',     
        '#000000',     
        '#FAFBFC',     
      ],
      default: '#FAFBFC'
    },

    
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

    
    welcomeMessage: {
      type: String,
      default: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
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