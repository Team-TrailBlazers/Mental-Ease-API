import { createCheckoutSession } from "../controllers/StripePayment.Controller.js";

const stripePaymentRoute = (app) => {
  app.route("/api/create-checkout-session").post(createCheckoutSession);
};

export default stripePaymentRoute;
