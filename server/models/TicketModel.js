// models/Ticket.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderType: { type: String, enum: ["user", "admin", "team"], required: true },
  senderId: { type: String, default: null }, 
  text: { type: String, required: true, trim: true },
  internal: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  userPhoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Invalid Indian Phone Number"]
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  initialMessage: {
    type: String,
    trim: true,
    default: "",
    required:true
  },

  clientSecret: {
    type: String,
    required: true,
    unique: false
  },


  messages: { type: [messageSchema], default: [] },
  status: { type: String, enum: ["open", "assigned", "in_progress", "resolved", "closed"], default: "open" },
  assignedToType: { type: String, enum: ["admin", "team", null], default: "admin" },
  assignedToId: { type: String, default: null }, 

  resolvedBy: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  resolutionNote: { type: String, default: "" },
  isMissedChat: { type: Boolean, default: false },

  consentAt: { type: Date, default: null }, 
  lastMessageAt: { type: Date, default: Date.now },

}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
