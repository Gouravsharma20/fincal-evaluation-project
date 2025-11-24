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
    const { userName, userEmail, userPhoneNumber,initialMessage} = req.body;
    if (!userName || !userEmail || !userPhoneNumber || !initialMessage) return res.status(400).json({ error: "userName, userEmail and userPhoneNumber required" });

    const clientSecret = crypto.randomBytes(16).toString("hex");

    const ticket = await Ticket.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      userPhoneNumber,
      initialMessage: initialMessage,
      messages: [
        { 
          senderType: "user", 
          senderId: null, 
          text: initialMessage,  // ADD THIS
          internal: false,       // ADD THIS
          createdAt: new Date()  // ADD THIS
        }
      ],
      status: "open",
      assignedToType: "admin",
      assignedToId: null,
      clientSecret:clientSecret
    });

    return res.status(201).json({
      success:true,
      ticketId: ticket._id,
      clientSecret:clientSecret,
      message: "We will respond you at earliest"
    });
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
    return res.json({success:true, ticket: publicTicket });
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
    if (ticket.status === "resolved") {
      return res.status(400).json({ error: "Ticket is already resolved" });
    }

    ticket.messages.push({
      senderType: "user",
      senderId: null,
      text,
      internal: false,
      createdAt: new Date()
     });
    ticket.status = "open";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({
      success:true,
      message: "Message added",
      ticketId: ticket._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createTicket, getTicket, addUserMessage };
