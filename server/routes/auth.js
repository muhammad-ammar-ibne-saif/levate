const router  = require("express").Router();
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const User    = require("../models/User");
const auth    = require("../middleware/auth");

// ── helpers ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

async function sendEmail({ to, subject, html }) {
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection before sending
  await transporter.verify();

  await transporter.sendMail({
    from: `"Team L-Evate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already in use." });

    const user  = await User.create({ firstName, lastName, email, password });
    const token = signToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

    const token = signToken(user._id);
    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Failed to update password." });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });

    // Always return success even if user not found (security)
    if (!user)
      return res.json({ message: "If this email exists, a code has been sent." });

    // Generate 6-digit code
    const code    = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed  = crypto.createHash("sha256").update(code).digest("hex");
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetCode        = hashed;
    user.resetCodeExpires = expires;
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: "Team L-Evate — Password Reset Code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0D0D0D;border-radius:16px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="display:inline-block;background:#7ED957;border-radius:16px;padding:12px 24px">
                <span style="color:#0D0D0D;font-size:22px;font-weight:800">Team L-Evate</span>
              </div>
            </div>
            <h2 style="color:#ffffff;text-align:center;margin-bottom:8px">Password Reset Code</h2>
            <p style="color:#9A9A9A;text-align:center;margin-bottom:24px">
              Use this code to reset your password. It expires in <strong style="color:#fff">15 minutes</strong>.
            </p>
            <div style="background:#1E1E1E;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;border:1px solid rgba(126,217,87,0.3)">
              <span style="color:#7ED957;font-size:44px;font-weight:800;letter-spacing:12px">${code}</span>
            </div>
            <p style="color:#5A5A5A;text-align:center;font-size:13px">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </div>
        `,
      });

      console.log(`✅ Reset code sent to ${email}`);
      res.json({ message: "Reset code sent to your email." });

    } catch (emailErr) {
      console.error("❌ Email send failed:", emailErr.message);
      console.error("Error code:", emailErr.code);
      console.error("Response:", emailErr.response);

      // Clear the code since email failed
      user.resetCode        = undefined;
      user.resetCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      // Give user a friendly message, log the real one server-side
      return res.status(500).json({
        message: "Could not send reset email. Please try again later.",
      });
    }

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ── POST /api/auth/verify-reset-code ─────────────────────────────────────────
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required." });

    const hashed = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email,
      resetCode:        hashed,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code. Please request a new one." });

    res.json({ message: "Code verified." });
  } catch (err) {
    console.error("Verify code error:", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword)
      return res.status(400).json({ message: "All fields are required." });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const hashed = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email,
      resetCode:        hashed,
      resetCodeExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code. Please start again." });

    user.password         = newPassword;
    user.resetCode        = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    console.log(`✅ Password reset for ${email}`);
    res.json({ message: "Password reset successfully." });

  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;