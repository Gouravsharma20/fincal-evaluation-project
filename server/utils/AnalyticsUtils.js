const Ticket = require("../models/TicketModel");
const Analytics = require("../models/AnalyticsModel");
const Settings = require("../models/SettingsModel");

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week: weekNum, year: d.getUTCFullYear() };
};

const calculateTotalChats = async () => {
  return await Ticket.countDocuments();
};

const calculateAverageReplyTime = async () => {
  const resolvedTickets = await Ticket.find({ status: "resolved" })
    .select({ createdAt: 1, resolvedAt: 1 });

  if (resolvedTickets.length === 0) return 0;

  const totalMilliseconds = resolvedTickets.reduce((sum, ticket) => {
    const milliseconds = (ticket.resolvedAt - ticket.createdAt);
    return sum + milliseconds;
  }, 0);

  const average = totalMilliseconds / resolvedTickets.length;
  return Math.floor(average);
};

const calculateResolvedTicketsPercentage = async () => {
  const total = await Ticket.countDocuments();
  const resolved = await Ticket.countDocuments({ status: "resolved" });

  if (total === 0) return 0;

  const percentage = (resolved / total) * 100;
  return Math.floor(percentage);
};

const getMissedChatsLast10Weeks = async () => {
  const analyticsData = await Analytics.find()
    .sort({ year: -1, week: -1 })
    .limit(10);
  return analyticsData.reverse().map(item => ({
    week: `Week ${item.week}`,  
    year: item.year,
    missedChatsCount: item.missedChatsCount
  }));
};

const incrementMissedChatsForWeek = async (ticketDate) => {
  const { week, year } = getISOWeek(ticketDate);

  await Analytics.updateOne(
    { week, year },
    { $inc: { missedChatsCount: 1 }, lastUpdatedAt: new Date() },
    { upsert: true } 
  );
};

const checkAndMarkMissedChat = (ticket, resolutionTimeLimit) => {
  if (!ticket.messages || ticket.messages.length === 0) {
    return false;
  }

  const lastUserMessage = ticket.messages
    .filter(m => m.senderType === 'user')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  if (!lastUserMessage) {
    return false;
  }

  const lastAdminMessage = ticket.messages
    .filter(m => m.senderType === 'admin' && new Date(m.createdAt) > new Date(lastUserMessage.createdAt))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  let timeDiffInMinutes;
  
  if (lastAdminMessage) {
    timeDiffInMinutes = (new Date(lastAdminMessage.createdAt) - new Date(lastUserMessage.createdAt)) / (1000 * 60);
  } else {
    timeDiffInMinutes = (Date.now() - new Date(lastUserMessage.createdAt)) / (1000 * 60);
  }

  if (timeDiffInMinutes > resolutionTimeLimit) {
    ticket.isMissedChat = true;
    return true;
  }

  return false;
};

const getAllAnalytics = async () => {
  const totalChats = await calculateTotalChats();
  const averageReplyTime = await calculateAverageReplyTime();
  const resolvedTicketsPercentage = await calculateResolvedTicketsPercentage();
  const missedChatsPerWeek = await getMissedChatsLast10Weeks();

  return {
    totalChats,
    averageReplyTime,
    resolvedTicketsPercentage,
    missedChatsPerWeek
  };
};

module.exports = {
  getISOWeek,
  calculateTotalChats,
  calculateAverageReplyTime,
  calculateResolvedTicketsPercentage,
  getMissedChatsLast10Weeks,
  incrementMissedChatsForWeek,
  checkAndMarkMissedChat,
  getAllAnalytics
};