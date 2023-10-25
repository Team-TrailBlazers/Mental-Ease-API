import express from "express";
import Socket from "socket.io";
import config from "./src/db/config.js";
import cors from "cors";
import bodyParser from "body-parser";
import { authMiddleware } from "./src/middlewares/Middlewares.js";
import userRoutes from "./src/routes/User.Route.js";
import appointmentRoutes from "./src/routes/Appointment.Route.js";
import stripePaymentRoute from "./src/routes/StripePayment.Route.js";
import formatMessage from "./src/utils/messages.js"
import  {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} from "./src/utils/users.js"

const app = express();
const server = http.createServer(app);
const io = Socket(server);

// built-in middleware
app.use(
  cors({
    origin: config.client,
  })
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

// Socket io
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat Bot';


// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    const roomName = room;

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, `Welcome to ${roomName} Room`));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Mental Ease API😀");
});

// port
app.listen(config.port, () => {
  console.log(`Server running at ${config.url}`);
});
