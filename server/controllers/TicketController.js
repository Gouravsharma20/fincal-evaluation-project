// controllers/ticketController.js
const crypto = require("crypto");
const Ticket = require("../models/TicketModel");
const adminConst = require('../constants/admin');

/**
 * createTicket (public)
 * returns { ticketId, clientSecret }
 */
const createTicket = async (req, res) => {
  try {
    const { userName, userEmail, userPhoneNumber, subject, description, consent } = req.body;
    if (!userName || !userEmail || !userPhoneNumber) return res.status(400).json({ error: "userName, userEmail and userPhoneNumber required" });

    const clientSecret = crypto.randomBytes(16).toString("hex");

    const ticket = await Ticket.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      userPhoneNumber,
      subject: subject || "",
      description: description || "",
      consentAt: consent ? Date.now() : null,
      messages: description ? [{ senderType: "user", text: description, internal: false }] : [],
      assignedToType: "admin",
      assignedToId: adminConst.ADMIN_ID,
      clientSecret
    });

    return res.status(201).json({ ticketId: ticket._id, clientSecret });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * getTicket (public): returns public view (internal messages filtered out)
 */
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const publicTicket = ticket.toObject();
    publicTicket.messages = publicTicket.messages.filter(m => !m.internal);
    // do not include clientSecret in response
    delete publicTicket.clientSecret;
    return res.json({ ticket: publicTicket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * addUserMessage (public follow-up) - requires clientSecret
 */
const addUserMessage = async (req, res) => {
  try {
    const { clientSecret, text } = req.body;
    if (!clientSecret || !text) return res.status(400).json({ error: "clientSecret and text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (!ticket.clientSecret || ticket.clientSecret !== clientSecret) {
      return res.status(403).json({ error: "Invalid client secret" });
    }

    ticket.messages.push({ senderType: "user", senderId: null, text, internal: false });
    ticket.status = "open";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({ message: "Message added", ticketId: ticket._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createTicket, getTicket, addUserMessage };
