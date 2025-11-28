// controllers/adminController.js
const Ticket = require("../models/TicketModel");
const User = require("../models/UserModel");
const crypto = require('crypto');
const bcrypt = require('bcrypt')

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
      ticket.clientSecret = crypto.randomBytes(16).toString('hex'); // 32 hex chars
    }

    ticket.status = "resolved";
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user._id;
    ticket.resolutionNote = resolutionNote || "";
    ticket.lastMessageAt = Date.now();


    const settings = await Settings.getInstance();
    const resolutionTimeLimit = settings.resolutionTimeLimit;

    const isMissed = checkAndMarkMissedChat(ticket, resolutionTimeLimit);

    // If missed, increment the analytics counter for that week
    if (isMissed) {
      await incrementMissedChatsForWeek(ticket.createdAt);
    }






    await ticket.save();

    return res.json({
      success: true,
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

    // Validation
    if (!name || !email || !designation) {
      return res.status(400).json({ error: "name, email, and designation are required" });
    }

    const newTeamMember = await User.register(name, email, email);

    newTeamMember.designation = designation;
    newTeamMember.role = "team_member";
    await newTeamMember.save();

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

/**
 * updateTeamMember (admin) - Update team member details
 * params: id
 * body: { name, designation } (email cannot be updated for security)
 */
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation } = req.body;

    // Validation
    if (!name && !designation) {
      return res.status(400).json({ error: "At least one field (name or designation) is required to update" });
    }

    const teamMember = await User.findById(id);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    // Prevent updating admin
    if (teamMember.email === "gouravsharma20a@gmail.com") {
      return res.status(403).json({ error: "Cannot update admin user" });
    }

    // Update fields
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

/**
 * deleteTeamMember (admin) - Delete a team member
 * params: id
 */
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await User.findById(id);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    // Prevent deleting admin
    if (teamMember.email === "gouravsharma20a@gmail.com") {
      return res.status(403).json({ error: "Cannot delete admin user" });
    }

    // Delete team member
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

module.exports = {
  listAllTickets,
  getTicketDetails,
  adminAddMessage,
  assignTicket,
  resolveTicket,
  listAllUsers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};