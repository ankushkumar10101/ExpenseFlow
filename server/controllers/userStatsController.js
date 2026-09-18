const User = require("../models/User");
const UserStats = require("../models/UserStats");
const { recalculateUserStats } = require("../services/userStatsService");

/**
 * Get user profile details and aggregated statistics
 */
async function getUserStats(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      user: null,
      stats: {},
    });
  }

  try {
    const user = await User.findById(req.user._id).select("-password -salt");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        user: null,
        stats: {},
      });
    }

    let stats = await UserStats.findOne({ user: req.user._id });
    if (!stats) {
      stats = await recalculateUserStats(req.user._id);
    }

    return res.status(200).json({
      success: true,
      message: "User stats loaded successfully",
      user,
      stats: stats || {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user stats: " + error.message,
    });
  }
}

module.exports = {
  getUserStats,
};
