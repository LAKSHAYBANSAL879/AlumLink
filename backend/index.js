const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const connectDB = require("./config/database.js");
const session = require('express-session');
const User = require('./models/User.js');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// Make io accessible in routes
app.io = io;

app.use(cookieParser());

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: 'ASDFGHJKL', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Authenticate user and join their personal room
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} authenticated and joined personal room`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/jobs", require("./routes/jobRoutes.js"));
app.use("/api/v1/application", require("./routes/applicationRoutes.js"));
app.use("/api/v1/donations", require("./routes/donationRoutes.js"));
app.use("/api/v1/notification", require("./routes/notificationRoutes.js"));
app.use("/api/v1/blogs", require("./routes/blogRoutes.js"));


// Ensure admin exists
(async () => {
  try {
    await User.ensureAdminExists();
    console.log("Admin account verified/created.");
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
})();

// Set the port
const PORT = process.env.PORT || 8081;

// Start the server (changed from app.listen to server.listen for Socket.IO)
server.listen(PORT, () => {
  console.log(`Node Server Running On Port ${PORT}`);
});