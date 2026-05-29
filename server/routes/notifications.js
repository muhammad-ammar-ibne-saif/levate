const router  = require("express").Router();
const fetch   = require("node-fetch");
const auth    = require("../middleware/auth");
const Notification = require("../models/Notification");
const User    = require("../models/User");

// ── POST /api/notifications/register-token ───────────────────────────────────
router.post("/register-token", auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required." });
    await User.findByIdAndUpdate(req.user._id, { pushToken: token });

    // Create a welcome notification for new users
    const existing = await Notification.countDocuments({ user: req.user._id });
    if (existing === 0) {
      await Notification.create({
        user:  req.user._id,
        title: "Welcome to Team L-Evate! 🎉",
        body:  `Hey ${req.user.firstName}! Your hybrid training plan is ready. Let's get started.`,
        type:  "system",
      });
    }

    res.json({ message: "Push token registered." });
  } catch {
    res.status(500).json({ message: "Failed to register token." });
  }
});

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ notifications });
  } catch {
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { read: true });
    res.json({ message: "All notifications marked as read." });
  } catch {
    res.status(500).json({ message: "Failed to mark as read." });
  }
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ message: "Notification marked as read." });
  } catch {
    res.status(500).json({ message: "Failed to mark as read." });
  }
});

// ── Helper: send push + save to DB ───────────────────────────────────────────
// Call this from anywhere in your backend to notify a user
async function sendPushToUser(userId, title, body, type = "system") {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Always save to DB inbox
    await Notification.create({ user: userId, title, body, type });

    // Send push only if user has a token and notifications enabled
    if (user.pushToken && user.notificationsEnabled) {
      const message = {
        to:    user.pushToken,
        sound: "default",
        title,
        body,
        data:  { type },
      };
      await fetch("https://exp.host/--/api/v2/push/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(message),
      });
    }
  } catch (err) {
    console.error("Push notification failed:", err.message);
  }
}

// ── POST /api/notifications/send (admin/internal use only) ───────────────────
// Protect this in production — add an admin check
router.post("/send", auth, async (req, res) => {
  try {
    const { userId, title, body, type } = req.body;
    await sendPushToUser(userId || req.user._id, title, body, type);
    res.json({ message: "Notification sent." });
  } catch {
    res.status(500).json({ message: "Failed to send notification." });
  }
});

module.exports = router;
module.exports.sendPushToUser = sendPushToUser;
