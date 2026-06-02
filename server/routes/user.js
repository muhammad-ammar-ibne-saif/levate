const router = require("express").Router();
const auth   = require("../middleware/auth");
const User   = require("../models/User");

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "email", "mobile", "goals", "daysPerWeek", "notificationsEnabled"];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

// POST /api/user/push-token
router.post("/push-token", auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required." });
    await User.findByIdAndUpdate(req.user._id, { pushToken: token });
    res.json({ message: "Push token saved." });
  } catch (err) {
    res.status(500).json({ message: "Failed to save push token." });
  }
});

module.exports = router;