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
  console.log('🔍 [checkAndMarkMissedChat] Starting check for ticket:', ticket._id);
  console.log('🔍 [checkAndMarkMissedChat] resolutionTimeLimit:', resolutionTimeLimit, 'minutes');
  
  if (!ticket.createdAt) {
    console.log('❌ [checkAndMarkMissedChat] No createdAt found');
    return false;
  }

  // 🆕 For UNRESOLVED tickets: Check time since creation
  if (!ticket.resolvedAt) {
    console.log('📌 [checkAndMarkMissedChat] Ticket is UNRESOLVED');
    
    const timeSinceCreation = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60);
    console.log('⏱️ [checkAndMarkMissedChat] Time since creation:', timeSinceCreation.toFixed(2), 'minutes');
    console.log('⏱️ [checkAndMarkMissedChat] Limit is:', resolutionTimeLimit, 'minutes');
    
    // Check if admin/team has replied
    const hasAdminOrTeamReplied = ticket.messages.some(
      msg => msg.senderType === 'admin' || msg.senderType === 'team'
    );
    console.log('💬 [checkAndMarkMissedChat] Has admin/team replied?', hasAdminOrTeamReplied);
    
    // If time exceeded and no admin/team reply yet, mark as missed
    if (timeSinceCreation > resolutionTimeLimit && !hasAdminOrTeamReplied) {
      console.log('✅ [checkAndMarkMissedChat] MARKING AS MISSED! Time exceeded and no reply');
      ticket.isMissedChat = true;
      return true;
    } else {
      console.log('⏳ [checkAndMarkMissedChat] NOT marking as missed. Time:', timeSinceCreation.toFixed(2), 'vs limit:', resolutionTimeLimit);
    }
    
    return false;
  }

  console.log('📌 [checkAndMarkMissedChat] Ticket is RESOLVED');
  
  // 🔄 For RESOLVED tickets: Check resolution time (existing logic)
  const resolutionTimeMinutes = (ticket.resolvedAt - ticket.createdAt) / (1000 * 60);
  console.log('⏱️ [checkAndMarkMissedChat] Resolution time:', resolutionTimeMinutes.toFixed(2), 'minutes');

  if (resolutionTimeMinutes > resolutionTimeLimit) {
    console.log('✅ [checkAndMarkMissedChat] MARKING AS MISSED! Resolution time exceeded');
    ticket.isMissedChat = true;
    return true;
  }

  console.log('⏳ [checkAndMarkMissedChat] NOT marking as missed. Resolution time within limit');
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