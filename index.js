import express from "express";
import config from "./src/db/config.js";
import cors from "cors";
import bodyParser from "body-parser";
import { authMiddleware } from "./src/middlewares/Middlewares.js";
import userRoutes from "./src/routes/User.Route.js";

const app = express();

//built inmiddleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// custom middleware
authMiddleware(app);

//routes
userRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

//port
app.listen(config.port, () => {
  console.log(`Server running at ${config.url}`);
});
