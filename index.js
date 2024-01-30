import express from "express";
import config from "./src/db/config.js";
import cors from "cors";
import bodyParser from "body-parser";
import { authMiddleware } from "./src/middlewares/Middlewares.js";
import userRoutes from "./src/routes/User.Route.js";
import appointmentRoutes from "./src/routes/Appointment.Route.js";
import stripePaymentRoute from "./src/routes/StripePayment.Route.js";
import { Server } from 'socket.io';
import http from 'http';

const app = express();

//built in middleware
app.use(cors());

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

server.listen(5000, () => {
  console.log('Socket listening to port 5000')
})

io.on('connection', (socket => {
  console.log(`User Connected: ${socket.id}`);
  //join room
  socket.io('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  //send message
  socket.on('send_message', (data) => {
    socket.io(data.room).emit('receive_message', data);
  });

  //leave room
  socket.on('leave_room', (data) => {
    socket.leave(data);
    console.log(`User with ID: ${socket.id} left room: ${data}`);
  })
  
}))

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

//port
app.listen(config.port || 3000, () => {
  console.log(`Server running on port ${config.port}`);
});
