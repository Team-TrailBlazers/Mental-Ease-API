import express from "express";
import config from "./src/db/config.js";
// import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

//built inmiddleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

//port
app.listen(config.port, () => {
  console.log(`Server running at ${config.url}`);
});
