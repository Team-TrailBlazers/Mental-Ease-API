import express from "express";
import config from "./src/db/config.js";
import cors from "cors";
import bodyParser from "body-parser";
import http from 'http';
import morgan from "morgan";
import { Server } from 'socket.io';
import { authMiddleware } from "./src/middlewares/Middlewares.js";
import routes from "./src/routes/index.js";

const app = express();

//built in middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, cors());

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
  });
});

// custom middleware
authMiddleware(app);

app.use(morgan("dev"));

//routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

//port
server.listen(config.port || 3000, () => {
  console.log(`Server running on port ${config.port}`);
});

