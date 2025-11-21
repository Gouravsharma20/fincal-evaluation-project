// controllers/adminController.js
const Ticket = require("../models/TicketModel");

/**
 * listTickets (admin) - paginated
 */
const listTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const q = req.query.q;
      filter.$or = [
        { userName: new RegExp(q, "i") },
        { userEmail: new RegExp(q, "i") },
        { userPhoneNumber: new RegExp(q, "i") }
      ];
    }

    const tickets = await Ticket.find(filter).sort({ lastMessageAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Ticket.countDocuments(filter);
    return res.json({ tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * adminAddMessage - called under isAdmin (Gourav injected)
 * body: { text, internal }
 */
const adminAddMessage = async (req, res) => {
  try {
    const { text, internal = false } = req.body;
    if (!text) return res.status(400).json({ error: "Message text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.messages.push({ senderType: "admin", senderId: req.user.id, text, internal });
    ticket.status = internal ? ticket.status : "in_progress";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({ message: "Admin message added", ticketId: ticket._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * assignTicket - admin assigns to team/agent
 * body: { assignedToType, assignedToId, note }
 */
const assignTicket = async (req, res) => {
  try {
    const { assignedToType, assignedToId, note } = req.body;
    if (!assignedToType || !assignedToId) return res.status(400).json({ error: "assignedToType and assignedToId required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.assignedToType = assignedToType;
    ticket.assignedToId = assignedToId;
    ticket.status = "assigned";
    ticket.messages.push({ senderType: "admin", senderId: req.user.id, text: `Assigned to ${assignedToType}:${assignedToId}${note ? " — " + note : ""}`, internal: true });
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.json({ message: "Ticket assigned", ticketId: ticket._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * teamAddMessage - team member posts
 * body: { text, internal }
 */
const teamAddMessage = async (req, res) => {
  try {
    const { text, internal = false } = req.body;
    if (!text) return res.status(400).json({ error: "Message text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // If ticket assigned to team, ensure requester belongs to that team
    if (ticket.assignedToType === "team" && ticket.assignedToId && ticket.assignedToId !== req.user.teamId) {
      return res.status(403).json({ error: "Ticket not assigned to your team" });
    }

    ticket.messages.push({ senderType: "team", senderId: req.user.id, text, internal });
    ticket.status = internal ? ticket.status : "in_progress";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({ message: "Team message added", ticketId: ticket._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * resolveTicket - admin/team resolves
 * body: { resolutionNote }
 */
const resolveTicket = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user.id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.json({ message: "Ticket resolved", ticketId: ticket._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { listTickets, adminAddMessage, assignTicket, teamAddMessage, resolveTicket };
