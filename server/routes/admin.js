const router  = require("express").Router();
const auth    = require("../middleware/auth");
const User    = require("../models/User");
const WorkoutSession = require("../models/WorkoutSession");

// Admin guard middleware
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required." });
  next();
};

// GET /api/admin/dashboard
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const now     = new Date();
    const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week    = new Date(today); week.setDate(today.getDate() - 7);

    const [totalUsers, activeToday, totalWorkouts, newSignups7d, recentSignups] = await Promise.all([
      User.countDocuments(),
      WorkoutSession.distinct("user", { createdAt: { $gte: today } }).then(a => a.length),
      WorkoutSession.countDocuments(),
      User.countDocuments({ createdAt: { $gte: week } }),
      User.find().sort({ createdAt: -1 }).limit(10).select("firstName lastName email createdAt isAdmin"),
    ]);

    res.json({ totalUsers, activeToday, totalWorkouts, newSignups7d, recentSignups });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Failed to load dashboard." });
  }
});

// GET /api/admin/users
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const query = search
      ? { $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName:  { $regex: search, $options: "i" } },
          { email:     { $regex: search, $options: "i" } },
        ]}
      : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("firstName lastName email isAdmin createdAt");
    res.json({ users });
  } catch (err) {
    console.error("Users list error:", err.message);
    res.status(500).json({ message: "Failed to load users." });
  }
});

// GET /api/admin/users/:id
router.get("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const workouts = await WorkoutSession.find({ user: req.params.id })
      .sort({ createdAt: -1 }).limit(10);

    const workoutCount  = await WorkoutSession.countDocuments({ user: req.params.id });
    const totalMinutes  = workouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

    res.json({
      user: {
        ...user.toObject(),
        workoutCount,
        totalMinutes,
        recentWorkouts: workouts.map(w => ({
          _id: w._id, name: w.name, type: w.type,
          durationMinutes: w.durationMinutes || 0,
          createdAt: w.createdAt,
        })),
        recentNotifications: [],
      },
    });
  } catch (err) {
    console.error("User detail error:", err.message);
    res.status(500).json({ message: "Failed to load user." });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "You cannot delete your own account." });
    await User.findByIdAndDelete(req.params.id);
    await WorkoutSession.deleteMany({ user: req.params.id });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// PATCH /api/admin/users/:id/admin
router.patch("/users/:id/admin", auth, adminOnly, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update admin status." });
  }
});

// POST /api/admin/users/:id/notify
router.post("/users/:id/notify", auth, adminOnly, async (req, res) => {
  try {
    const { title, body } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.pushToken) {
      const payload = {
        to: user.pushToken,
        sound: "default",
        title, body,
        data: { type: "admin" },
      };
      await fetch(process.env.EXPO_PUSH_ENDPOINT || "https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const Notification = require("../models/Notification");
    await Notification.create({ user: req.params.id, title, body, type: "system" });
    res.json({ message: "Notification sent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send notification." });
  }
});

module.exports = router;