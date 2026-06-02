// const dns = require("dns");
// dns.setDefaultResultOrder("ipv4first");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config({ path: "./.env" });

const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const http       = require("http");
const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");

const authRoutes         = require("./routes/auth");
const userRoutes         = require("./routes/user");
const workoutRoutes      = require("./routes/workout");
const chatRoutes         = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const adminRoutes        = require("./routes/admin");
const communityRoutes    = require("./routes/community");

const User    = require("./models/User");
const Message = require("./models/Message");

const app    = express();
const server = http.createServer(app);   // ← wrap express in http server for socket.io
const PORT   = process.env.PORT || 4000;

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Middleware to auth socket connections via JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("firstName lastName isAdmin");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
});

// Track typing users
const typingUsers = new Map(); // userId → { name, timeout }

io.on("connection", (socket) => {
  const user = socket.user;
  console.log(`🟢 ${user.firstName} connected to community`);

  // Join the single community room
  socket.join("community");

  // ── Send message ────────────────────────────────────────────────────────────
  socket.on("send_message", async (data) => {
    try {
      const content = (data.content || "").trim();
      if (!content || content.length > 1000) return;

      // Profanity check placeholder — add library if needed
      const message = await Message.create({
        user:      user._id,
        firstName: user.firstName,
        lastName:  user.lastName || "",
        content,
      });

      const payload = {
        _id:       message._id,
        user:      user._id,
        firstName: user.firstName,
        lastName:  user.lastName || "",
        content,
        createdAt: message.createdAt,
        deleted:   false,
      };

      // Broadcast to everyone in the room including sender
      io.to("community").emit("new_message", payload);
      console.log(`💬 [Community] ${user.firstName}: "${content.slice(0, 40)}"`);

    } catch (err) {
      console.error("Send message error:", err.message);
      socket.emit("error", { message: "Failed to send message." });
    }
  });

  // ── Typing indicator ────────────────────────────────────────────────────────
  socket.on("typing_start", () => {
    // Clear existing timeout for this user
    if (typingUsers.has(user._id.toString())) {
      clearTimeout(typingUsers.get(user._id.toString()).timeout);
    }

    // Auto-clear typing after 3 seconds
    const timeout = setTimeout(() => {
      typingUsers.delete(user._id.toString());
      socket.to("community").emit("typing_update", getTypingNames());
    }, 3000);

    typingUsers.set(user._id.toString(), {
      name: user.firstName,
      timeout,
    });

    socket.to("community").emit("typing_update", getTypingNames());
  });

  socket.on("typing_stop", () => {
    if (typingUsers.has(user._id.toString())) {
      clearTimeout(typingUsers.get(user._id.toString()).timeout);
      typingUsers.delete(user._id.toString());
    }
    socket.to("community").emit("typing_update", getTypingNames());
  });

  // ── Delete message ──────────────────────────────────────────────────────────
  socket.on("delete_message", async (data) => {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) return;

      // Only owner or admin can delete
      if (message.user.toString() !== user._id.toString() && !user.isAdmin) return;

      message.deleted   = true;
      message.deletedAt = new Date();
      message.content   = "This message was deleted.";
      await message.save();

      // Tell everyone to remove/grey out this message
      io.to("community").emit("message_deleted", { messageId: data.messageId });
      console.log(`🗑 Message deleted by ${user.firstName}`);

    } catch (err) {
      console.error("Delete message socket error:", err.message);
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    if (typingUsers.has(user._id.toString())) {
      clearTimeout(typingUsers.get(user._id.toString()).timeout);
      typingUsers.delete(user._id.toString());
      socket.to("community").emit("typing_update", getTypingNames());
    }
    console.log(`🔴 ${user.firstName} disconnected from community`);
  });
});

function getTypingNames() {
  return Array.from(typingUsers.values()).map(u => u.name);
}

// ── Express middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/chat",
  rateLimit({ windowMs: 60*1000, max: 20, message: "Too many requests" }));
app.use("/api/auth",
  rateLimit({ windowMs: 15*60*1000, max: 20, message: "Too many auth attempts" }));
app.use("/api/community",
  rateLimit({ windowMs: 60*1000, max: 60, message: "Slow down" }));

// ── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/workouts",      workoutRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/community",     communityRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────────────────────
// Use server.listen (not app.listen) so socket.io works
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
