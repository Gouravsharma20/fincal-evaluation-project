// utils/analyticsUtils.js
const Ticket = require("../models/TicketModel");
const Analytics = require("../models/AnalyticsModel");
const Settings = require("../models/SettingsModel");

/**
 * Get ISO week number and year from a date
 * @param {Date} date
 * @returns {Object} { week, year }
 */
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week: weekNum, year: d.getUTCFullYear() };
};

/**
 * Calculate total number of tickets
 * @returns {Promise<number>}
 */
const calculateTotalChats = async () => {
  return await Ticket.countDocuments();
};

/**
 * Calculate average reply time (in minutes, floored)
 * Average resolution time = sum of (resolvedAt - createdAt) / count of resolved tickets
 * @returns {Promise<number>}
 */
const calculateAverageReplyTime = async () => {
  const resolvedTickets = await Ticket.find({ status: "resolved" })
    .select({ createdAt: 1, resolvedAt: 1 });

  if (resolvedTickets.length === 0) return 0;

  const totalMinutes = resolvedTickets.reduce((sum, ticket) => {
    const minutes = (ticket.resolvedAt - ticket.createdAt) / (1000 * 60);
    return sum + minutes;
  }, 0);

  const average = totalMinutes / resolvedTickets.length;
  return Math.floor(average);
};

/**
 * Calculate resolved tickets percentage
 * @returns {Promise<number>}
 */
const calculateResolvedTicketsPercentage = async () => {
  const total = await Ticket.countDocuments();
  const resolved = await Ticket.countDocuments({ status: "resolved" });

  if (total === 0) return 0;

  const percentage = (resolved / total) * 100;
  return Math.floor(percentage);
};

/**
 * Get missed chats data for last 10 weeks
 * @returns {Promise<Array>}
 */
const getMissedChatsLast10Weeks = async () => {
  // Get last 10 weeks of data
  const analyticsData = await Analytics.find()
    .sort({ year: -1, week: -1 })
    .limit(10);

  // Reverse to show chronologically (oldest to newest)
  return analyticsData.reverse();
};

/**
 * Increment missed chats count for a specific week
 * Called when a ticket is marked as isMissedChat: true
 * @param {Date} ticketDate - The date when the ticket was created/resolved
 * @returns {Promise<void>}
 */
const incrementMissedChatsForWeek = async (ticketDate) => {
  const { week, year } = getISOWeek(ticketDate);

  await Analytics.updateOne(
    { week, year },
    { $inc: { missedChatsCount: 1 }, lastUpdatedAt: new Date() },
    { upsert: true } // Create if doesn't exist
  );
};

/**
 * Mark ticket as missed chat if it exceeds resolution time limit
 * @param {Object} ticket - Ticket document
 * @param {number} resolutionTimeLimit - Time limit in minutes
 * @returns {boolean} - true if marked as missed, false otherwise
 */
const checkAndMarkMissedChat = (ticket, resolutionTimeLimit) => {
  if (!ticket.resolvedAt || !ticket.createdAt) return false;

  const resolutionTimeMinutes = (ticket.resolvedAt - ticket.createdAt) / (1000 * 60);

  if (resolutionTimeMinutes > resolutionTimeLimit) {
    ticket.isMissedChat = true;
    return true;
  }

  return false;
};

/**
 * Get all analytics data for dashboard
 * @returns {Promise<Object>}
 */
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