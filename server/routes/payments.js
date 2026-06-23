const router  = require("express").Router();
const auth    = require("../middleware/auth");
const User    = require("../models/User");
const Stripe  = require("stripe");

const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-checkout
// Creates a Stripe SetupIntent or PaymentIntent with trial
router.post("/create-checkout", auth, async (req, res) => {
  try {
    const { priceId, email } = req.body;

    // Create or retrieve Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email || req.user.email,
        metadata: { userId: req.user._id.toString() },
      });
      stripeCustomerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId });
    }

    // Create subscription with 7-day trial — payment collected upfront but not charged yet
    const subscription = await stripe.subscriptions.create({
      customer:         stripeCustomerId,
      items:            [{ price: priceId }],
      trial_period_days: 7,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand:           ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice?.payment_intent;

    // If trial = no immediate payment needed, mark subscribed immediately
    if (!paymentIntent || subscription.status === "trialing") {
      await User.findByIdAndUpdate(req.user._id, {
        subscribed:         true,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: "trialing",
        subscriptionPlan:   priceId,
      });
      return res.json({ success: true, trialing: true, clientSecret: null });
    }

    res.json({ clientSecret: paymentIntent.client_secret, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Create checkout error:", err.message);
    res.status(500).json({ message: err.message || "Failed to create checkout session." });
  }
});

// POST /api/payments/confirm
// Confirms payment with card details
router.post("/confirm", auth, async (req, res) => {
  try {
    const { clientSecret, cardNumber, expMonth, expYear, cvc, name } = req.body;

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number:    cardNumber,
        exp_month: parseInt(expMonth),
        exp_year:  parseInt("20" + expYear),
        cvc,
      },
      billing_details: { name },
    });

    // Confirm the payment intent
    const intentId = clientSecret.split("_secret_")[0];
    const confirmed = await stripe.paymentIntents.confirm(intentId, {
      payment_method: paymentMethod.id,
    });

    if (confirmed.status === "succeeded" || confirmed.status === "requires_capture") {
      await User.findByIdAndUpdate(req.user._id, {
        subscribed:         true,
        subscriptionStatus: "trialing",
      });
      return res.json({ success: true });
    }

    res.json({ success: false, message: "Payment not completed. Please try again." });
  } catch (err) {
    console.error("Confirm payment error:", err.message);
    // Provide user-friendly Stripe error messages
    const msg = err.code === "card_declined"         ? "Your card was declined."
              : err.code === "incorrect_cvc"         ? "Incorrect CVC code."
              : err.code === "expired_card"          ? "Your card has expired."
              : err.code === "insufficient_funds"    ? "Insufficient funds."
              : err.message || "Payment failed. Please try again.";
    res.status(400).json({ message: msg });
  }
});

// GET /api/payments/status
// Check subscription status
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      subscribed:         user.subscribed          || false,
      subscriptionStatus: user.subscriptionStatus  || "none",
      subscriptionPlan:   user.subscriptionPlan    || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to check subscription status." });
  }
});

// POST /api/payments/cancel
// Cancel subscription
router.post("/cancel", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    }
    await User.findByIdAndUpdate(req.user._id, {
      subscribed:         false,
      subscriptionStatus: "cancelled",
    });
    res.json({ message: "Subscription cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});

module.exports = router;