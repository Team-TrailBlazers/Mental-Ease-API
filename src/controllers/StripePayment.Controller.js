import stripe from "stripe";
import config from "./../db/config.js";
// import sql from "mssql";

const stripeInstance = stripe(config.stripe_secret_key);
const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Therapy Session" }],
  [2, { priceInCents: 20000, name: "Mental Session" }],
  [3, { priceInCents: 30000, name: "Psychological Session" }],
]);

export const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${config.client}/success`,
      cancel_url: `${config.client}/`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
