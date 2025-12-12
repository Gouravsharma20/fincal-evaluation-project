// const checkAndMarkMissedChat = (ticket, resolutionTimeLimit) => {
//   console.log('🔍 [checkAndMarkMissedChat] Starting check for ticket:', ticket._id);
//   console.log('🔍 [checkAndMarkMissedChat] resolutionTimeLimit:', resolutionTimeLimit, 'minutes');
  
//   if (!ticket.messages || ticket.messages.length === 0) {
//     console.log('❌ [checkAndMarkMissedChat] No messages found');
//     return false;
//   }

//   // ✅ Get last user message
//   const lastUserMessage = ticket.messages
//     .filter(m => m.senderType === 'user')
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

//   if (!lastUserMessage) {
//     console.log('❌ [checkAndMarkMissedChat] No user messages found');
//     return false;
//   }

//   console.log('📝 [checkAndMarkMissedChat] Last user message at:', lastUserMessage.createdAt);

//   // ✅ Get last admin message (after the last user message)
//   const lastAdminMessage = ticket.messages
//     .filter(m => m.senderType === 'admin' && new Date(m.createdAt) > new Date(lastUserMessage.createdAt))
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

//   console.log('💬 [checkAndMarkMissedChat] Has admin replied after last user message?', !!lastAdminMessage);

//   // ✅ Calculate time difference
//   let timeDiffInMinutes;
  
//   if (lastAdminMessage) {
//     // Time between last user message and admin's reply
//     timeDiffInMinutes = (new Date(lastAdminMessage.createdAt) - new Date(lastUserMessage.createdAt)) / (1000 * 60);
//     console.log('⏱️ [checkAndMarkMissedChat] Admin replied after:', timeDiffInMinutes.toFixed(2), 'minutes');
//   } else {
//     // Time since last user message (no admin reply yet)
//     timeDiffInMinutes = (Date.now() - new Date(lastUserMessage.createdAt)) / (1000 * 60);
//     console.log('⏱️ [checkAndMarkMissedChat] Time since last user message (no admin reply):', timeDiffInMinutes.toFixed(2), 'minutes');
//   }

//   console.log('⏱️ [checkAndMarkMissedChat] Threshold:', resolutionTimeLimit, 'minutes');

//   // ✅ Check if time exceeded
//   if (timeDiffInMinutes > resolutionTimeLimit) {
//     console.log('✅ [checkAndMarkMissedChat] MARKING AS MISSED! Time exceeded');
//     ticket.isMissedChat = true;
//     return true;
//   }

//   console.log('⏳ [checkAndMarkMissedChat] NOT marking as missed. Time within limit');
//   return false;
// };




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

// ✅ CORRECTED LOGIC
const checkAndMarkMissedChat = (ticket, resolutionTimeLimit) => {
  console.log('🔍 [checkAndMarkMissedChat] Starting check for ticket:', ticket._id);
  console.log('🔍 [checkAndMarkMissedChat] resolutionTimeLimit:', resolutionTimeLimit, 'minutes');
  
  if (!ticket.messages || ticket.messages.length === 0) {
    console.log('❌ [checkAndMarkMissedChat] No messages found');
    return false;
  }

  // ✅ Get last user message
  const lastUserMessage = ticket.messages
    .filter(m => m.senderType === 'user')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  if (!lastUserMessage) {
    console.log('❌ [checkAndMarkMissedChat] No user messages found');
    return false;
  }

  console.log('📝 [checkAndMarkMissedChat] Last user message at:', lastUserMessage.createdAt);

  // ✅ Get last admin message (after the last user message)
  const lastAdminMessage = ticket.messages
    .filter(m => m.senderType === 'admin' && new Date(m.createdAt) > new Date(lastUserMessage.createdAt))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  console.log('💬 [checkAndMarkMissedChat] Has admin replied after last user message?', !!lastAdminMessage);

  // ✅ Calculate time difference
  let timeDiffInMinutes;
  
  if (lastAdminMessage) {
    // Time between last user message and admin's reply
    timeDiffInMinutes = (new Date(lastAdminMessage.createdAt) - new Date(lastUserMessage.createdAt)) / (1000 * 60);
    console.log('⏱️ [checkAndMarkMissedChat] Admin replied after:', timeDiffInMinutes.toFixed(2), 'minutes');
  } else {
    // Time since last user message (no admin reply yet)
    timeDiffInMinutes = (Date.now() - new Date(lastUserMessage.createdAt)) / (1000 * 60);
    console.log('⏱️ [checkAndMarkMissedChat] Time since last user message (no admin reply):', timeDiffInMinutes.toFixed(2), 'minutes');
  }

  console.log('⏱️ [checkAndMarkMissedChat] Threshold:', resolutionTimeLimit, 'minutes');

  // ✅ Check if time exceeded
  if (timeDiffInMinutes > resolutionTimeLimit) {
    console.log('✅ [checkAndMarkMissedChat] MARKING AS MISSED! Time exceeded');
    ticket.isMissedChat = true;
    return true;
  }

  console.log('⏳ [checkAndMarkMissedChat] NOT marking as missed. Time within limit');
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

// ✅ EXPORT ALL FUNCTIONS
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