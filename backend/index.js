const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const connectDB = require("./config/database.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User.js');
const http = require('http');
const socketIO = require('socket.io');
const { initializeSocket } = require('./socket.js');

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

// Initialize Socket.IO
const { connectedUsers } = initializeSocket(io);
global.io = io;

app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ MongoDB session store setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'ASDFGHJKL',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60, // 14 days
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: 'lax'
  }
}));

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/jobs", require("./routes/jobRoutes.js"));
app.use("/api/v1/application", require("./routes/applicationRoutes.js"));
app.use("/api/v1/donations", require("./routes/donationRoutes.js"));
app.use("/api/v1/notification", require("./routes/notificationRoutes.js"));
app.use("/api/v1/blogs", require("./routes/blogRoutes.js"));
app.use("/api/v1/messages", require("./routes/messageRoutes.js"));

// Ensure admin exists
(async () => {
  try {
    await User.ensureAdminExists();
    console.log("Admin account verified/created.");
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
})();

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Node Server Running On Port ${PORT}`);
});
