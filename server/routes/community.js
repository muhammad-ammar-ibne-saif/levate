const router  = require("express").Router();
const auth    = require("../middleware/auth");
const Message = require("../models/Message");

// GET /api/community/messages — last 200 messages on open
router.get("/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Return in chronological order
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// DELETE /api/community/messages/:id — delete own message
router.delete("/messages/:id", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found." });

    if (message.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ message: "You can only delete your own messages." });

    message.deleted   = true;
    message.deletedAt = new Date();
    message.content   = "This message was deleted.";
    await message.save();

    res.json({ message: "Message deleted." });
  } catch (err) {
    console.error("Delete message error:", err.message);
    res.status(500).json({ message: "Failed to delete message." });
  }
});

// POST /api/community/messages/:id/report — report a message
router.post("/messages/:id/report", auth, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { reported: true });
    res.json({ message: "Message reported. Our team will review it." });
  } catch (err) {
    res.status(500).json({ message: "Failed to report message." });
  }
});

// GET /api/community/messages/reported — admin only
router.get("/messages/reported", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Admin only." });

    const messages = await Message.find({ reported: true, deleted: false })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("user", "firstName lastName email");

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reported messages." });
  }
});

module.exports = router;
