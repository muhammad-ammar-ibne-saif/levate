const router  = require("express").Router();
const auth    = require("../middleware/auth");
const WorkoutSession = require("../models/WorkoutSession");
const User    = require("../models/User");
const { sendPushToUser } = require("./notifications");

// POST /api/workouts/complete
router.post("/complete", auth, async (req, res) => {
  try {
    const { name, type, durationMinutes, setsCompleted, calories } = req.body;
    const session = await WorkoutSession.create({
      user: req.user._id,
      name, type,
      durationMinutes: durationMinutes || 0,
      setsCompleted:   setsCompleted   || 0,
      calories:        calories        || 0,
      week:    req.user.currentWeek    || 1,
      program: req.user.currentProgram,
    });

    // Count sessions this week to check for streak
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = await WorkoutSession.countDocuments({
      user:      req.user._id,
      createdAt: { $gte: weekStart },
    });

    // Send completion notification
    await sendPushToUser(
      req.user._id,
      "Workout Complete! 💪",
      `Great job finishing "${name}"! ${durationMinutes || 0} mins · ${calories || 0} kcal burned.`,
      "workout"
    );

    // Streak milestone notifications
    if (weekCount === 3) {
      await sendPushToUser(req.user._id, "3 workouts this week! 🔥", "You're on fire — halfway through your weekly goal.", "streak");
    }
    if (weekCount >= 5) {
      await sendPushToUser(req.user._id, "Week goal achieved! ⭐", "5 workouts this week. Incredible consistency!", "streak");
    }

    res.status(201).json({ session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save workout session." });
  }
});

// GET /api/workouts/history
router.get("/history", auth, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);

    // Calculate streak
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daySet = new Set(sessions.map(s => {
      const d = new Date(s.createdAt); d.setHours(0, 0, 0, 0); return d.getTime();
    }));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (daySet.has(d.getTime())) streak++;
      else if (i > 0) break;
    }

    res.json({ sessions, streak });
  } catch {
    res.status(500).json({ message: "Failed to fetch history." });
  }
});

// GET /api/workouts/progress
router.get("/progress", auth, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ user: req.user._id });
    const byWeek = {};
    let totalDuration = 0, totalCalories = 0, totalSets = 0;

    sessions.forEach(s => {
      const w = s.week;
      if (!byWeek[w]) byWeek[w] = { duration: 0, sets: 0, calories: 0, count: 0 };
      byWeek[w].duration  += s.durationMinutes || 0;
      byWeek[w].sets      += s.setsCompleted   || 0;
      byWeek[w].calories  += s.calories        || 0;
      byWeek[w].count     += 1;
      totalDuration += s.durationMinutes || 0;
      totalCalories += s.calories        || 0;
      totalSets     += s.setsCompleted   || 0;
    });

    res.json({
      byWeek,
      currentWeek:    req.user.currentWeek || 1,
      totalWeeks:     8,
      totalSessions:  sessions.length,
      totalDuration,
      totalCalories,
      totalSets,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch progress." });
  }
});

// GET /api/workouts/today
router.get("/today", auth, async (req, res) => {
  try {
    const todayWorkouts = [
      { _id: "w1", name: "Lower power + carries", type: "lift", duration: 45, sets: "5+1" },
      { _id: "w2", name: "Threshold Builder Run",  type: "run",  duration: 35, zone: "Zone 3–4" },
    ];
    res.json({ workouts: todayWorkouts, week: req.user.currentWeek || 1 });
  } catch {
    res.status(500).json({ message: "Failed to fetch today's workouts." });
  }
});

module.exports = router;
