const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/user/me
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "mobile", "avatar", "goals", "notificationsEnabled"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;
