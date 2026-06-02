const router = require("express").Router();
const auth   = require("../middleware/auth");

// ── POST /api/chat ────────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    if (!message?.trim())
      return res.status(400).json({ message: "Message is required." });

    if (!process.env.ANTHROPIC_API_KEY)
      return res.status(500).json({ message: "AI service not configured." });

    const systemPrompt = `You are an expert hybrid training coach and AI assistant for Team L-Evate, a fitness app.

User context:
- Name: ${userContext.name || req.user.firstName}
- Current week: ${userContext.week || req.user.currentWeek || 1} of ${userContext.totalWeeks || 8}
- Program: ${userContext.program || req.user.currentProgram || "8-Week Hybrid Foundation"}
- Today's workout: ${userContext.todayWorkout || "Not specified"}
- Goals: ${(userContext.goals || req.user.goals || ["race"]).join(", ")}

Your role:
- Give personalised, practical advice about training, nutrition, recovery, and race prep
- Reference the user's current program and week when relevant
- Keep responses concise (2-4 sentences) and conversational
- Use the user's name occasionally to keep it personal
- NEVER give medical diagnosis or specific medication advice
- Stay focused on fitness and training topics only
- If asked something off-topic, politely redirect back to training`;

    const messages = [
      ...history.slice(-10).map((m) => ({
        role:    m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system:     systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic error:", err);
      if (response.status === 401)
        return res.status(500).json({ message: "AI authentication failed." });
      if (response.status === 429)
        return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
      if (response.status === 529)
        return res.status(503).json({ message: "AI service overloaded. Please try again shortly." });
      return res.status(500).json({ message: "AI service unavailable. Please try again." });
    }

    const data  = await response.json();
    const reply = data.content?.[0]?.text?.trim();

    if (!reply)
      return res.status(500).json({ message: "No response from AI. Please try again." });

    console.log(`💬 Chat [${req.user.firstName}]: "${message.slice(0, 50)}..." → replied`);
    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ message: "Chat service unavailable. Please try again." });
  }
});

module.exports = router;