// controllers/adminController.js
const Ticket = require("../models/TicketModel");
const User = require("../models/UserModel");
const crypto = require('crypto');

/**
 * listTickets (admin) - paginated
 */


const listAllTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const filter = {
      assignedToType: "admin",
      assignedToId: null 
    };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const q = req.query.q;
      filter.$or = [
        { userName: new RegExp(q, "i") },
        { userEmail: new RegExp(q, "i") },
        { userPhoneNumber: new RegExp(q, "i") }
      ];
    }

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
        lastMessageAt: 1,
        createdAt: 1,
        messages: { $slice: 1 }
      });
    const total = await Ticket.countDocuments(filter);
    return res.json({
      success:true,
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


const getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // ADD THIS: Verify ticket is assigned to admin
    if (ticket.assignedToType !== "admin" || ticket.assignedToId !== null) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    return res.json({ 
      success: true,  // ADD THIS
      ticket 
    });
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

    if (ticket.assignedToType !== "admin" || ticket.assignedToId !== null) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    ticket.messages.push({
      senderType: "admin",
      senderId: req.user._id,
      text,
      internal,
      createdAt: Date.now()
    });
    if (!internal) {
      ticket.status = "in_progress";  // ADD THIS
    }
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({
      success:true,
      message: internal ? "Internal note added" : "Message sent to customer",
      ticketId:ticket._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const assignTicket = async (req, res) => {
  try {
    const {assignedToId, note } = req.body;
    if (!assignedToId) {
      return res.status(400).json({ error: "assignedToId required" });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.assignedToType !== "admin" || ticket.assignedToId !== null) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    const teamMember = await User.findById(assignedToId);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    ticket.assignedToType = "team";
    ticket.assignedToId = assignedToId;
    ticket.status = "assigned";


    ticket.messages.push({
      senderType: "admin",
      senderId: req.user._id,
      text: `Assigned to ${teamMember.name}${note ? " — " + note : ""}`,
      internal: true,
      createdAt: Date.now()
    });

    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.json({
      success:true,
      message: `Ticket assigned to ${teamMember.name}. It will now appear in their queue.`,
      ticketId: ticket._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const resolveTicket = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.assignedToType !== "admin") {
      return res.status(403).json({ error: "This ticket is not assigned to admin" });
    }

    if (!ticket.clientSecret) {
      ticket.clientSecret = crypto.randomBytes(16).toString('hex'); // 32 hex chars
    }

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user._id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.json({
      success:true,
      message: "Ticket resolved",
      ticketId: ticket._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const listAllUsers = async (req, res) => {
  try {
    const users = await User.find({ email: { $ne: "gouravsharma20a@gmail.com" } })
      .select({ name: 1, email: 1, _id: 1 })
      .limit(100);

    return res.json({ 
      success: true,  // ADD THIS
      users 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  listAllTickets,
  getTicketDetails,
  adminAddMessage,
  assignTicket,
  resolveTicket,
  listAllUsers,
};
