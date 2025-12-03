// const Ticket = require("../models/TicketModel");


// const getAssignedTickets = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page || "1", 10));
//     const limit = Math.min(100, parseInt(req.query.limit || "20", 10));

//     const filter = {
//       assignedToType: "team",
//       assignedToId: req.user._id.toString()
//     };

//     if (req.query.status) filter.status = req.query.status;

//     const tickets = await Ticket.find(filter)
//       .sort({ lastMessageAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .select({
//         _id: 1,
//         userName: 1,
//         userEmail: 1,
//         userPhoneNumber: 1,
//         status: 1,
//         isMissedChat: 1,
//         lastMessageAt: 1,
//         createdAt: 1,
//         messages: { $slice: 1 }
//       });

//     const total = await Ticket.countDocuments(filter);

//     return res.json({
//       success: true,
//       tickets,
//       total,
//       page,
//       pages: Math.ceil(total / limit)
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


// const getTicketDetail = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//     if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "This ticket is not assigned to you" });
//     }

//     return res.json({
//       success: true,
//       ticket
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


// const addTeamMessage = async (req, res) => {
//   try {
//     const { text, internal = false } = req.body;
//     if (!text) return res.status(400).json({ error: "Message text required" });

//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//     if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "This ticket is not assigned to you" });
//     }

//     ticket.messages.push({
//       senderType: "team",
//       senderId: req.user._id,
//       text,
//       internal,
//       createdAt: Date.now()
//     });

//     if (!internal) {
//       ticket.status = "in_progress";
//       ticket.isMissedChat = false;
//     }
//     ticket.lastMessageAt = Date.now();
//     await ticket.save();

//     return res.status(201).json({
//       success: true,
//       message: internal ? "Internal note added" : "Message sent to customer",
//       ticketId: ticket._id,
//       ticket 
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


// const resolveTicketByTeam = async (req, res) => {
//   try {
//     const { resolutionNote } = req.body;

//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//     if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "This ticket is not assigned to you" });
//     }

//     ticket.status = "resolved";
//     ticket.resolvedAt = Date.now();
//     ticket.resolvedBy = req.user._id;
//     ticket.resolutionNote = resolutionNote || "";
//     ticket.lastMessageAt = Date.now();

//     await ticket.save();

//     return res.json({
//       success: true,
//       message: "Ticket marked as resolved",
//       ticketId: ticket._id,
//       ticket
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// module.exports = {
//   getAssignedTickets,
//   getTicketDetail,
//   addTeamMessage,
//   resolveTicketByTeam
// };


const Ticket = require("../models/TicketModel");
const Settings = require("../models/SettingsModel");
const {
  checkAndMarkMissedChat,
  incrementMissedChatsForWeek
} = require("../utils/AnalyticsUtils");

// 🆕 HELPER: Batch update missed tickets for team members
const updateMissedTicketsInBatch = async (resolutionTimeLimit) => {
  try {
    const cutoffTime = new Date(Date.now() - resolutionTimeLimit * 60 * 1000);

    const result = await Ticket.updateMany(
      {
        assignedToType: "team",
        status: { $in: ['open', 'assigned', 'in_progress'] },
        isMissedChat: false,
        createdAt: { $lt: cutoffTime },
        'messages.senderType': { $nin: ['admin', 'team'] }
      },
      {
        $set: { isMissedChat: true }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Marked ${result.modifiedCount} team tickets as missed (batch update)`);
    }

    return result.modifiedCount;
  } catch (err) {
    console.error('Team batch update failed:', err);
    return 0;
  }
};

const getAssignedTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));

    const filter = {
      assignedToType: "team",
      assignedToId: req.user._id.toString()
    };

    if (req.query.status) filter.status = req.query.status;

    // 🆕 UPDATE MISSED TICKETS BEFORE FETCHING
    try {
      const settings = await Settings.getInstance();
      await updateMissedTicketsInBatch(settings.resolutionTimeLimit);
    } catch (err) {
      console.warn("Team batch update failed (non-critical):", err);
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


const getTicketDetail = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    // 🆕 CHECK AND MARK MISSED CHAT BEFORE RETURNING
    try {
      const settings = await Settings.getInstance();
      const resolutionTimeLimit = settings.resolutionTimeLimit;

      const wasMissedBefore = ticket.isMissedChat;
      const isMissedNow = checkAndMarkMissedChat(ticket, resolutionTimeLimit);

      if (!wasMissedBefore && isMissedNow && ticket.status !== 'resolved') {
        console.log(`✅ Marking team ticket ${ticket._id} as missed chat (on detail fetch)`);
        await ticket.save();
      }
    } catch (analyticsErr) {
      console.warn("Analytics calculation failed (non-critical):", analyticsErr);
    }

    return res.json({
      success: true,
      ticket
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const addTeamMessage = async (req, res) => {
  try {
    const { text, internal = false } = req.body;
    if (!text) return res.status(400).json({ error: "Message text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

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
      // 🔄 KEEP isMissedChat as is - don't reset it to false
      // ticket.isMissedChat remains true if it was already marked as missed
    }
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({
      success: true,
      message: internal ? "Internal note added" : "Message sent to customer",
      ticketId: ticket._id,
      ticket
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const resolveTicketByTeam = async (req, res) => {
  try {
    const { resolutionNote } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.assignedToType !== "team" || ticket.assignedToId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user._id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();

    // 🆕 CHECK AND MARK MISSED CHAT ON RESOLVE
    try {
      const settings = await Settings.getInstance();
      const resolutionTimeLimit = settings.resolutionTimeLimit;

      const isMissed = checkAndMarkMissedChat(ticket, resolutionTimeLimit);

      if (isMissed) {
        await incrementMissedChatsForWeek(ticket.createdAt);
      }

    } catch (analyticsErr) {
      console.warn("Analytics calculation failed (non-critical):", analyticsErr);
    }

    await ticket.save();

    return res.json({
      success: true,
      message: "Ticket marked as resolved",
      ticketId: ticket._id,
      isMissedChat: ticket.isMissedChat || false,
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