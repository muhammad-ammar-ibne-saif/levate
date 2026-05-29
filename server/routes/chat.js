const router = require("express").Router();
const auth   = require("../middleware/auth");

// ── POST /api/chat ────────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    if (!message?.trim())
      return res.status(400).json({ message: "Message is required." });

    if (!process.env.OPENAI_API_KEY)
      return res.status(500).json({ message: "OpenAI API key not configured." });

    // Build system prompt with user context injected
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

    // Build messages array for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((m) => ({
        role:    m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI API directly using fetch (no SDK needed)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:       process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        max_tokens:  400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("OpenAI error:", errData);

      // Give user friendly messages for common errors
      if (response.status === 401)
        return res.status(500).json({ message: "AI service authentication failed. Check OPENAI_API_KEY." });
      if (response.status === 429)
        return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
      if (response.status === 402 || errData?.error?.code === "insufficient_quota")
        return res.status(500).json({ message: "AI service quota exceeded. Please try again later." });

      return res.status(500).json({ message: "AI service unavailable. Please try again." });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

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