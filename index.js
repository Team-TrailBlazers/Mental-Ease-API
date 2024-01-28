import express from "express";
import config from "./src/db/config.js";
import cors from "cors";
import bodyParser from "body-parser";
import { authMiddleware } from "./src/middlewares/Middlewares.js";
import userRoutes from "./src/routes/User.Route.js";
import appointmentRoutes from "./src/routes/Appointment.Route.js";
import stripePaymentRoute from "./src/routes/StripePayment.Route.js";
const app = express();

//built in middleware
app.use(
  cors()
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// custom middleware
authMiddleware(app);

//routes
userRoutes(app);
appointmentRoutes(app);
stripePaymentRoute(app);

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

//port
app.listen(config.port || 3000, () => {
  console.log(`Server running`);
});
