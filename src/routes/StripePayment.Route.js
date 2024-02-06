import { createCheckoutSession, webhookEvents } from "../controllers/StripePayment.Controller.js";
import  express  from 'express';
import { userLoginRequired } from './../middlewares/Middlewares.js';




const stripePaymentRoute = (app) => {

  app.route("/api/create-checkout-session").post(createCheckoutSession);
 app.route("/api/webhook").post(express.raw({type: 'application/json'}), webhookEvents);

};

export default stripePaymentRoute;
//11:19