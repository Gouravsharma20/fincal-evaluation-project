// models/Ticket.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderType: { type: String, enum: ["user","admin","team"], required: true },
  senderId: { type: String, default: null }, // optional: userId/adminId/teamId
  text: { type: String, required: true, trim: true },
  internal: { type: Boolean, default: false }, // internal note (admins/teams only)
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  userName: { type: String, required: true, trim: true, minlength:3 , maxlength:50 },
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

  subject: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },

  // conversation messages
  messages: { type: [messageSchema], default: [] },

  // ownership & assignment: by default admin owns new tickets
  status: { type: String, enum: ["open","assigned","in_progress","resolved","closed"], default: "open" },
  assignedToType: { type: String, enum: ["admin","team","agent", null], default: "admin" },
  assignedToId: { type: String, default: null }, // e.g. teamId or adminId

  // resolution
  resolvedBy: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  resolutionNote: { type: String, default: "" },

  // meta
  consentAt: { type: Date, default: null }, // store when user allowed messages
  lastMessageAt: { type: Date, default: Date.now },

}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
