// Vercel serverless function (Node). No Express needed.
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 6 Feb 2026 00:00:00 UTC
const TRIAL_END = 1770336000;

// Allow CORS so Squarespace (your site) can call this function
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url:
        "https://adhdremapped.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://adhdremapped.com/cancel",
      line_items: [
        // £150 now (one-off sign-up payment)
        { price: "price_1SSJ8JD5bnakvwEIXmBcQUCe", quantity: 1 },
        // £150/month (first charge at trial end)
        { price: "price_1SSJ8eD5bnakvwEIFAvRTlsz", quantity: 1 }
      ],
      subscription_data: {
        trial_end: TRIAL_END
      },
      allow_promotion_codes: true
      // Optional quality-of-life fields:
      // customer_creation: "if_required",
      // client_reference_id: "USER_ID_FROM_YOUR_SYSTEM"
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
