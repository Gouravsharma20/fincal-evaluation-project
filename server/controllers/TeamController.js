// controllers/TeamController.js
const Ticket = require("../models/TicketModel");

/**
 * getAssignedTickets (team member) - view only tickets assigned to them
 */
const getAssignedTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));

    // Find tickets assigned to this team member
    const filter = {
      assignedToType: "team",
      assignedToId: req.user._id.toString()
    };

    if (req.query.status) filter.status = req.query.status;

    const tickets = await Ticket.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select({
        _id: 1,
        userName: 1,
        userEmail: 1,
        userPhoneNumber: 1,
        status: 1,
        isMissedChat: 1,
        lastMessageAt: 1,
        createdAt: 1,
        messages: { $slice: 1 }
      });

    const total = await Ticket.countDocuments(filter);

    return res.json({
      success: true,
      tickets,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * getTicketDetail (team member) - view specific assigned ticket
 * Can only view if assigned to them
 * ✅ Returns isMissedChat flag so UI can show indicator
 */
const getTicketDetail = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Verify ticket is assigned to this team member
    if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    // Team member sees all messages including internal notes for their assigned tickets
    return res.json({
      success: true,
      ticket
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * addTeamMessage (team member) - add message to assigned ticket
 * body: { text, internal }
 * internal = true for private notes
 * ✅ FIX: Clear isMissedChat flag when team member replies to customer
 */
const addTeamMessage = async (req, res) => {
  try {
    const { text, internal = false } = req.body;
    if (!text) return res.status(400).json({ error: "Message text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Verify ticket is assigned to this team member
    if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    ticket.messages.push({
      senderType: "team",
      senderId: req.user._id,
      text,
      internal,
      createdAt: Date.now()
    });

    if (!internal) {
      ticket.status = "in_progress";
      // ✅ FIX: Clear isMissedChat when team member sends customer-visible message
      ticket.isMissedChat = false;
    }
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({
      success: true,
      message: internal ? "Internal note added" : "Message sent to customer",
      ticketId: ticket._id,
      ticket // ✅ Return updated ticket with isMissedChat flag
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * resolveTicketByTeam (team member) - mark ticket as resolved
 * body: { resolutionNote }
 */
const resolveTicketByTeam = async (req, res) => {
  try {
    const { resolutionNote } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Verify ticket is assigned to this team member
    if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user._id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();

    await ticket.save();

    return res.json({
      success: true,
      message: "Ticket marked as resolved",
      ticketId: ticket._id,
      ticket
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAssignedTickets,
  getTicketDetail,
  addTeamMessage,
  resolveTicketByTeam
};