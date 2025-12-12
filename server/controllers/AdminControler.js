



const Ticket = require("../models/TicketModel");
const User = require("../models/UserModel");
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const Settings = require("../models/SettingsModel");
const {
  checkAndMarkMissedChat,
  incrementMissedChatsForWeek,
  getAllAnalytics
} = require("../utils/AnalyticsUtils");

// ✅ IMPROVED: Batch update using proper logic
const updateMissedTicketsInBatch = async (resolutionTimeLimit) => {
  try {
    console.log('🔄 [Batch Update] Starting batch update with limit:', resolutionTimeLimit, 'minutes');
    
    // Get all open tickets that might need updating
    const tickets = await Ticket.find({
      status: 'open',
      isMissedChat: false
    });

    console.log('🔄 [Batch Update] Found', tickets.length, 'open tickets to check');

    let updatedCount = 0;

    for (const ticket of tickets) {
      const shouldBeMissed = checkAndMarkMissedChat(ticket, resolutionTimeLimit);
      
      if (shouldBeMissed) {
        ticket.isMissedChat = true;
        await ticket.save();
        await incrementMissedChatsForWeek(ticket.createdAt);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ [Batch Update] Marked ${updatedCount} tickets as missed`);
    } else {
      console.log(`⏳ [Batch Update] No tickets needed updating`);
    }

    return updatedCount;
  } catch (err) {
    console.error('❌ [Batch Update] Failed:', err);
    return 0;
  }
};

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

    // ✅ UPDATE MISSED TICKETS BEFORE FETCHING
    try {
      const settings = await Settings.getInstance();
      await updateMissedTicketsInBatch(settings.resolutionTimeLimit);
    } catch (err) {
      console.warn("❌ Batch update failed (non-critical):", err);
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
        messages: { $slice: 1 },
        isMissedChat: 1
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

const getTicketDetails = async (req, res) => {
  console.log('========== TICKET DETAILS CALLED ==========');
  console.log('🎯 Ticket ID:', req.params.id);
  console.log('🎯 Request path:', req.path);
  console.log('🎯 Request method:', req.method);

  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      console.log('❌ Ticket not found in database');
      return res.status(404).json({ error: "Ticket not found" });
    }

    console.log('✅ Ticket found in database');
    console.log('🎯 Current isMissedChat:', ticket.isMissedChat);
    console.log('🎯 Ticket status:', ticket.status);
    console.log('🎯 Created at:', ticket.createdAt);
    console.log('🎯 Messages count:', ticket.messages?.length || 0);

    if (ticket.assignedToType !== "admin" || ticket.assignedToId !== null) {
      console.log('❌ Ticket not assigned to admin');
      return res.status(403).json({ error: "This ticket is not assigned to you" });
    }

    // ✅ ALWAYS check and update missed chat status
    try {
      const settings = await Settings.getInstance();
      const resolutionTimeLimit = settings.resolutionTimeLimit;
      console.log('🎯 Resolution time limit from settings:', resolutionTimeLimit, 'minutes');

      const originalMissedStatus = ticket.isMissedChat;
      console.log('🎯 Original isMissedChat status:', originalMissedStatus);

      // Run the check
      const shouldBeMissed = checkAndMarkMissedChat(ticket, resolutionTimeLimit);
      console.log('🎯 checkAndMarkMissedChat returned:', shouldBeMissed);

      // Save if status changed
      if (shouldBeMissed && !originalMissedStatus) {
        console.log('✅ Ticket should be marked as missed - SAVING TO DATABASE');
        ticket.isMissedChat = true;
        await ticket.save();
        console.log('✅ Ticket SAVED successfully to database');

        // Increment analytics
        await incrementMissedChatsForWeek(ticket.createdAt);
        console.log('✅ Analytics updated');
      } else if (!shouldBeMissed && originalMissedStatus) {
        console.log('⚠️ Ticket was marked as missed but should not be - keeping as is');
      } else if (originalMissedStatus) {
        console.log('⏭️ Already marked as missed, no change needed');
      } else {
        console.log('⏳ Time within limit, not marking as missed');
      }
    } catch (analyticsErr) {
      console.error("❌ Analytics calculation failed:", analyticsErr);
      console.error(analyticsErr.stack);
    }

    console.log('🎯 FINAL isMissedChat before returning:', ticket.isMissedChat);
    console.log('========== RETURNING TICKET TO FRONTEND ==========');

    return res.json({
      success: true,
      ticket
    });
  } catch (err) {
    console.error('❌ Fatal error in getTicketDetails:', err);
    console.error(err.stack);
    return res.status(500).json({ error: "Server error" });
  }
};

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
      ticket.status = "in_progress";
    }
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    return res.status(201).json({
      success: true,
      message: internal ? "Internal note added" : "Message sent to customer",
      ticketId: ticket._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { assignedToId, note } = req.body;
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
      success: true,
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
      ticket.clientSecret = crypto.randomBytes(16).toString('hex');
    }

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user._id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();

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
      message: "Ticket resolved",
      ticketId: ticket._id,
      isMissedChat: ticket.isMissedChat || false
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const listAllUsers = async (req, res) => {
  try {
    const users = await User.find({ email: { $ne: "gouravsharma20a@gmail.com" } })
      .select({ designation: 1, _id: 1, name: 1, email: 1 })
      .limit(100);

    const adminUser = {
      designation: "Admin",
      _id: "6924cdfa002795cf8aea42ed",
      name: "Gourav Sharma",
      email: "gouravsharma20a@gmail.com",
    };

    const allUsers = [adminUser, ...users];

    return res.json({
      success: true,
      users: allUsers
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const createTeamMember = async (req, res) => {
  try {
    const { name, email, designation } = req.body;

    if (!name || !email || !designation) {
      return res.status(400).json({ error: "name, email, and designation are required" });
    }

    const newTeamMember = await User.register(name, email, email);

    newTeamMember.designation = designation;
    newTeamMember.role = "team_member";
    await newTeamMember.save();

    return res.status(201).json({
      success: true,
      message: "Team member created successfully",
      teamMember: {
        _id: newTeamMember._id,
        name: newTeamMember.name,
        email: newTeamMember.email,
        designation: newTeamMember.designation,
        role: newTeamMember.role
      }
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes("Email already exists")) {
      return res.status(409).json({ error: "Email already registered" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation } = req.body;

    if (!name && !designation) {
      return res.status(400).json({ error: "At least one field (name or designation) is required to update" });
    }

    const teamMember = await User.findById(id);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    if (teamMember.email === "gouravsharma20a@gmail.com") {
      return res.status(403).json({ error: "Cannot update admin user" });
    }

    if (name) teamMember.name = name;
    if (designation) teamMember.designation = designation;

    await teamMember.save();

    return res.json({
      success: true,
      message: "Team member updated successfully",
      teamMember: {
        _id: teamMember._id,
        name: teamMember.name,
        email: teamMember.email,
        designation: teamMember.designation,
        role: teamMember.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await User.findById(id);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    if (teamMember.email === "gouravsharma20a@gmail.com") {
      return res.status(403).json({ error: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Team member deleted successfully",
      deletedTeamMemberId: id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    return res.json({
      success: true,
      settings: {
        resolutionTimeLimit: settings.resolutionTimeLimit,
        lastUpdatedAt: settings.lastUpdatedAt,
        lastUpdatedBy: settings.lastUpdatedBy
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { resolutionTimeLimit } = req.body;

    if (resolutionTimeLimit === undefined || resolutionTimeLimit === null) {
      return res.status(400).json({ error: "resolutionTimeLimit is required" });
    }

    if (typeof resolutionTimeLimit !== "number" || resolutionTimeLimit < 1) {
      return res.status(400).json({ error: "resolutionTimeLimit must be a positive number (in minutes)" });
    }

    const settings = await Settings.getInstance();
    settings.resolutionTimeLimit = resolutionTimeLimit;
    settings.lastUpdatedBy = req.user._id || req.user.email;
    settings.lastUpdatedAt = new Date();

    await settings.save();

    return res.json({
      success: true,
      message: `Resolution time limit updated to ${resolutionTimeLimit} minutes`,
      settings: {
        resolutionTimeLimit: settings.resolutionTimeLimit,
        lastUpdatedAt: settings.lastUpdatedAt,
        lastUpdatedBy: settings.lastUpdatedBy
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = await getAllAnalytics();

    return res.json({
      success: true,
      analytics: {
        totalChats: analytics.totalChats,
        averageReplyTime: analytics.averageReplyTime,
        resolvedTicketsPercentage: analytics.resolvedTicketsPercentage,
        missedChatsPerWeek: analytics.missedChatsPerWeek.map(item => ({
          week: item.week,
          year: item.year,
          missedChatsCount: item.missedChatsCount
        }))
      }
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
  getSettings,
  updateSettings,
  getAnalytics,
  listAllUsers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
