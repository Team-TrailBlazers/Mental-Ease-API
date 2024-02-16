import  express  from 'express';
import { createCheckoutSession, webhookEvents } from "../controllers/StripePayment.Controller.js";
import { userLoginRequired } from './../middlewares/Middlewares.js';

const router = express.Router();

router.post("/api/create-checkout-session", userLoginRequired, createCheckoutSession);

router.post("/api/webhook", webhookEvents);

export default router;
