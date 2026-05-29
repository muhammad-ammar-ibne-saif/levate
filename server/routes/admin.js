const router = require("express").Router();
const auth   = require("../middleware/auth");
const User   = require("../models/User");
const WorkoutSession = require("../models/WorkoutSession");
const Notification   = require("../models/Notification");

// ── Admin middleware ──────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Access denied. Admin only." });
  next();
};

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const now       = new Date();
    const today     = new Date(now); today.setHours(0,0,0,0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart= new Date(now); monthStart.setDate(now.getDate() - 30);

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalWorkouts,
      workoutsToday,
      workoutsWeek,
      totalNotifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      WorkoutSession.countDocuments(),
      WorkoutSession.countDocuments({ createdAt: { $gte: today } }),
      WorkoutSession.countDocuments({ createdAt: { $gte: weekStart } }),
      Notification.countDocuments(),
    ]);

    // Active users (completed workout in last 7 days)
    const activeUserIds = await WorkoutSession.distinct("user", {
      createdAt: { $gte: weekStart },
    });

    // Recent signups (last 5)
    const recentSignups = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt");

    res.json({
      stats: {
        totalUsers,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
        totalWorkouts,
        workoutsToday,
        workoutsWeek,
        activeUsersThisWeek: activeUserIds.length,
        totalNotifications,
      },
      recentSignups,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err.message);
    res.status(500).json({ message: "Failed to fetch dashboard data." });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName:  { $regex: search, $options: "i" } },
            { email:     { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -resetCode -resetCodeExpires"),
      User.countDocuments(query),
    ]);

    // Get workout counts for each user
    const userIds = users.map(u => u._id);
    const workoutCounts = await WorkoutSession.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 }, totalMinutes: { $sum: "$durationMinutes" } } },
    ]);
    const wcMap = {};
    workoutCounts.forEach(w => { wcMap[w._id.toString()] = w; });

    const enriched = users.map(u => ({
      ...u.toJSON(),
      workoutCount:  wcMap[u._id.toString()]?.count        || 0,
      totalMinutes:  wcMap[u._id.toString()]?.totalMinutes || 0,
    }));

    res.json({ users: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// ── GET /api/admin/users/:id ──────────────────────────────────────────────────
router.get("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetCode -resetCodeExpires");

    if (!user) return res.status(404).json({ message: "User not found." });

    const [sessions, notifications] = await Promise.all([
      WorkoutSession.find({ user: req.params.id })
        .sort({ createdAt: -1 }).limit(20),
      Notification.find({ user: req.params.id })
        .sort({ createdAt: -1 }).limit(10),
    ]);

    const totalMinutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    const totalCals    = sessions.reduce((a, s) => a + (s.calories        || 0), 0);
    const totalSets    = sessions.reduce((a, s) => a + (s.setsCompleted   || 0), 0);

    res.json({
      user,
      sessions,
      notifications,
      summary: {
        totalWorkouts: sessions.length,
        totalMinutes,
        totalCalories: totalCals,
        totalSets,
      },
    });
  } catch (err) {
    console.error("Admin user detail error:", err.message);
    res.status(500).json({ message: "Failed to fetch user details." });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Cannot delete your own admin account." });

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      WorkoutSession.deleteMany({ user: req.params.id }),
      Notification.deleteMany({   user: req.params.id }),
    ]);

    res.json({ message: "User and all their data deleted." });
  } catch (err) {
    console.error("Admin delete user error:", err.message);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// ── POST /api/admin/notify-all ────────────────────────────────────────────────
router.post("/notify-all", auth, adminOnly, async (req, res) => {
  try {
    const { title, body, type = "system" } = req.body;
    if (!title || !body)
      return res.status(400).json({ message: "Title and body are required." });

    const { sendPushToUser } = require("./notifications");
    const users = await User.find({ notificationsEnabled: true }).select("_id");

    let sent = 0;
    for (const user of users) {
      await sendPushToUser(user._id, title, body, type);
      sent++;
    }

    res.json({ message: `Notification sent to ${sent} users.`, sent });
  } catch (err) {
    console.error("Admin notify-all error:", err.message);
    res.status(500).json({ message: "Failed to send notifications." });
  }
});

// ── POST /api/admin/notify-user ───────────────────────────────────────────────
router.post("/notify-user", auth, adminOnly, async (req, res) => {
  try {
    const { userId, title, body, type = "system" } = req.body;
    if (!userId || !title || !body)
      return res.status(400).json({ message: "userId, title and body are required." });

    const { sendPushToUser } = require("./notifications");
    await sendPushToUser(userId, title, body, type);

    res.json({ message: "Notification sent." });
  } catch (err) {
    console.error("Admin notify-user error:", err.message);
    res.status(500).json({ message: "Failed to send notification." });
  }
});

module.exports = router;
